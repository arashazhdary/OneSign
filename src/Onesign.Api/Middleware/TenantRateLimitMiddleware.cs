using System.Collections.Concurrent;
using System.Net;
using System.Text.Json;
using Onesign.Shared.MultiTenancy;
using Onesign.Shared.Services;

namespace Onesign.Api.Middleware;

/// <summary>
/// Middleware that applies per-tenant rate limiting based on tenant plan and endpoint
/// </summary>
public class TenantRateLimitMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<TenantRateLimitMiddleware> _logger;
    private readonly ConcurrentDictionary<string, TenantRateLimitInfo> _rateLimitStore = new();

    // Default rate limits per tenant plan tier
    private readonly Dictionary<string, RateLimitConfig> _planLimits = new()
    {
        { "free", new RateLimitConfig { RequestsPerMinute = 60, RequestsPerHour = 1000, BurstLimit = 10 } },
        { "starter", new RateLimitConfig { RequestsPerMinute = 300, RequestsPerHour = 5000, BurstLimit = 50 } },
        { "professional", new RateLimitConfig { RequestsPerMinute = 1000, RequestsPerHour = 20000, BurstLimit = 100 } },
        { "enterprise", new RateLimitConfig { RequestsPerMinute = 5000, RequestsPerHour = 100000, BurstLimit = 500 } }
    };

    // Endpoint-specific rate limit multipliers (lower = more restricted)
    private readonly Dictionary<string, double> _endpointMultipliers = new()
    {
        { "/api/auth", 0.5 },           // Auth endpoints are more restricted
        { "/api/users", 1.0 },
        { "/api/applications", 1.0 },
        { "/api/audit", 2.0 },          // Audit can be queried more frequently
        { "/connect/token", 0.3 }       // Token endpoint is heavily restricted
    };

    public TenantRateLimitMiddleware(RequestDelegate next, ILogger<TenantRateLimitMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(
        HttpContext context,
        ITenantContextAccessor tenantContextAccessor,
        IResourceQuotaService resourceQuotaService)
    {
        // Skip rate limiting for health checks
        if (context.Request.Path.StartsWithSegments("/health") ||
            context.Request.Path.StartsWithSegments("/ready"))
        {
            await _next(context);
            return;
        }

        var tenantId = tenantContextAccessor.GetCurrentTenantId();

        if (!tenantId.HasValue)
        {
            // Apply default rate limiting for unauthenticated requests
            if (await CheckGlobalRateLimit(context))
            {
                await _next(context);
            }
            return;
        }

        // Get tenant plan (default to free if not found)
        var tenantPlan = context.Items.TryGetValue("TenantPlan", out var plan)
            ? plan?.ToString()?.ToLowerInvariant() ?? "free"
            : "free";

        var rateLimitConfig = _planLimits.GetValueOrDefault(tenantPlan, _planLimits["free"]);

        // Apply endpoint multiplier
        var endpointMultiplier = GetEndpointMultiplier(context.Request.Path);
        var effectiveLimit = (int)(rateLimitConfig.RequestsPerMinute * endpointMultiplier);

        var key = $"{tenantId}:{context.Request.Path.Value?.Split('/').Take(3).Aggregate((a, b) => $"{a}/{b}") ?? "default"}";

        var rateLimitInfo = _rateLimitStore.GetOrAdd(key, _ => new TenantRateLimitInfo
        {
            TenantId = tenantId.Value,
            Plan = tenantPlan
        });

        bool shouldBlock;
        int remaining;
        DateTime resetTime;

        lock (rateLimitInfo)
        {
            // Reset window if expired
            if (DateTime.UtcNow - rateLimitInfo.WindowStart > TimeSpan.FromMinutes(1))
            {
                rateLimitInfo.Count = 0;
                rateLimitInfo.WindowStart = DateTime.UtcNow;
            }

            // Check burst limit
            var burstKey = $"{key}:burst";
            var now = DateTime.UtcNow;
            var burstCount = rateLimitInfo.BurstTimestamps.Count(t => now - t < TimeSpan.FromSeconds(1));

            if (burstCount >= rateLimitConfig.BurstLimit)
            {
                shouldBlock = true;
                remaining = 0;
            }
            else if (rateLimitInfo.Count >= effectiveLimit)
            {
                shouldBlock = true;
                remaining = 0;
            }
            else
            {
                rateLimitInfo.Count++;
                rateLimitInfo.BurstTimestamps.Add(now);

                // Clean old burst timestamps
                rateLimitInfo.BurstTimestamps.RemoveAll(t => now - t > TimeSpan.FromSeconds(1));

                shouldBlock = false;
                remaining = effectiveLimit - rateLimitInfo.Count;
            }

            resetTime = rateLimitInfo.WindowStart.AddMinutes(1);
        }

        // Set rate limit headers
        context.Response.Headers["X-RateLimit-Limit"] = effectiveLimit.ToString();
        context.Response.Headers["X-RateLimit-Remaining"] = remaining.ToString();
        context.Response.Headers["X-RateLimit-Reset"] = new DateTimeOffset(resetTime).ToUnixTimeSeconds().ToString();

        if (shouldBlock)
        {
            _logger.LogWarning("Rate limit exceeded for tenant {TenantId} on {Path}. Plan: {Plan}, Limit: {Limit}",
                tenantId, context.Request.Path, tenantPlan, effectiveLimit);

            // Track API call quota
            await resourceQuotaService.IncrementUsageAsync(tenantId.Value, ResourceType.ApiCalls);

            context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
            context.Response.Headers["Retry-After"] = ((int)(resetTime - DateTime.UtcNow).TotalSeconds).ToString();
            context.Response.ContentType = "application/json";

            var response = JsonSerializer.Serialize(new
            {
                errorCode = "RATE_LIMIT_EXCEEDED",
                errorMessage = "Too many requests. Please slow down.",
                limit = effectiveLimit,
                remaining = 0,
                resetAt = resetTime
            });

            await context.Response.WriteAsync(response);
            return;
        }

        // Track API call
        await resourceQuotaService.IncrementUsageAsync(tenantId.Value, ResourceType.ApiCalls);

        await _next(context);
    }

    private async Task<bool> CheckGlobalRateLimit(HttpContext context)
    {
        var clientIp = GetClientIp(context);
        var key = $"global:{clientIp}";
        var limit = 30; // 30 requests per minute for unauthenticated

        var rateLimitInfo = _rateLimitStore.GetOrAdd(key, _ => new TenantRateLimitInfo
        {
            TenantId = Guid.Empty
        });

        bool shouldBlock;
        int remaining;

        lock (rateLimitInfo)
        {
            if (DateTime.UtcNow - rateLimitInfo.WindowStart > TimeSpan.FromMinutes(1))
            {
                rateLimitInfo.Count = 0;
                rateLimitInfo.WindowStart = DateTime.UtcNow;
            }

            if (rateLimitInfo.Count >= limit)
            {
                shouldBlock = true;
                remaining = 0;
            }
            else
            {
                rateLimitInfo.Count++;
                shouldBlock = false;
                remaining = limit - rateLimitInfo.Count;
            }
        }

        context.Response.Headers["X-RateLimit-Limit"] = limit.ToString();
        context.Response.Headers["X-RateLimit-Remaining"] = remaining.ToString();

        if (shouldBlock)
        {
            _logger.LogWarning("Global rate limit exceeded for IP {ClientIp}", clientIp);

            context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
            context.Response.ContentType = "application/json";

            var response = JsonSerializer.Serialize(new
            {
                errorCode = "RATE_LIMIT_EXCEEDED",
                errorMessage = "Too many requests. Please try again later."
            });

            await context.Response.WriteAsync(response);
            return false;
        }

        return true;
    }

    private double GetEndpointMultiplier(PathString path)
    {
        foreach (var (endpoint, multiplier) in _endpointMultipliers)
        {
            if (path.StartsWithSegments(endpoint, StringComparison.OrdinalIgnoreCase))
            {
                return multiplier;
            }
        }

        return 1.0;
    }

    private static string GetClientIp(HttpContext context)
    {
        var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrEmpty(forwardedFor))
        {
            return forwardedFor.Split(',')[0].Trim();
        }

        var realIp = context.Request.Headers["X-Real-IP"].FirstOrDefault();
        if (!string.IsNullOrEmpty(realIp))
        {
            return realIp;
        }

        return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }

    private class TenantRateLimitInfo
    {
        public Guid TenantId { get; set; }
        public string Plan { get; set; } = "free";
        public int Count { get; set; }
        public DateTime WindowStart { get; set; } = DateTime.UtcNow;
        public List<DateTime> BurstTimestamps { get; set; } = new();
    }

    private class RateLimitConfig
    {
        public int RequestsPerMinute { get; set; }
        public int RequestsPerHour { get; set; }
        public int BurstLimit { get; set; }
    }
}
