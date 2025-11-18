using System.Collections.Concurrent;
using System.Net;
using System.Text.Json;
using Onesign.Shared.MultiTenancy;

namespace Onesign.Api.Middleware;

/// <summary>
/// Advanced rate limiting middleware that provides per-tenant and per-endpoint rate limiting
/// with configurable limits, sliding window counters, and detailed headers.
/// </summary>
public class RateLimitingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RateLimitingMiddleware> _logger;
    private readonly IConfiguration _configuration;
    private readonly ConcurrentDictionary<string, RateLimitEntry> _rateLimitStore = new();

    private readonly Dictionary<string, EndpointRateLimitConfig> _endpointConfigs = new(StringComparer.OrdinalIgnoreCase)
    {
        { "/connect/token", new EndpointRateLimitConfig { RequestsPerMinute = 20, BurstLimit = 5, WindowSeconds = 60 } },
        { "/api/auth/login", new EndpointRateLimitConfig { RequestsPerMinute = 30, BurstLimit = 10, WindowSeconds = 60 } },
        { "/api/auth/register", new EndpointRateLimitConfig { RequestsPerMinute = 10, BurstLimit = 3, WindowSeconds = 60 } },
        { "/api/auth/forgot-password", new EndpointRateLimitConfig { RequestsPerMinute = 5, BurstLimit = 2, WindowSeconds = 60 } },
        { "/api/users", new EndpointRateLimitConfig { RequestsPerMinute = 100, BurstLimit = 20, WindowSeconds = 60 } },
        { "/api/applications", new EndpointRateLimitConfig { RequestsPerMinute = 100, BurstLimit = 20, WindowSeconds = 60 } },
        { "/api/audit", new EndpointRateLimitConfig { RequestsPerMinute = 200, BurstLimit = 50, WindowSeconds = 60 } }
    };

    private readonly Dictionary<string, TenantPlanLimits> _planLimits = new(StringComparer.OrdinalIgnoreCase)
    {
        { "free", new TenantPlanLimits { BaseMultiplier = 1.0, MaxRequestsPerMinute = 60, MaxBurst = 10 } },
        { "starter", new TenantPlanLimits { BaseMultiplier = 3.0, MaxRequestsPerMinute = 300, MaxBurst = 50 } },
        { "professional", new TenantPlanLimits { BaseMultiplier = 10.0, MaxRequestsPerMinute = 1000, MaxBurst = 100 } },
        { "enterprise", new TenantPlanLimits { BaseMultiplier = 50.0, MaxRequestsPerMinute = 5000, MaxBurst = 500 } }
    };

    public RateLimitingMiddleware(RequestDelegate next, ILogger<RateLimitingMiddleware> logger, IConfiguration configuration)
    {
        _next = next;
        _logger = logger;
        _configuration = configuration;
    }

    public async Task InvokeAsync(HttpContext context, ITenantContextAccessor tenantContextAccessor)
    {
        if (ShouldSkipRateLimiting(context.Request.Path))
        {
            await _next(context);
            return;
        }

        var tenantId = tenantContextAccessor.GetCurrentTenantId();
        var clientIdentifier = GetClientIdentifier(context, tenantId);
        var endpointConfig = GetEndpointConfig(context.Request.Path);
        var planLimits = GetPlanLimits(context);

        var effectiveLimit = CalculateEffectiveLimit(endpointConfig, planLimits);
        var rateLimitKey = BuildRateLimitKey(clientIdentifier, context.Request.Path);

        var rateLimitResult = CheckRateLimit(rateLimitKey, effectiveLimit);

        SetRateLimitHeaders(context, effectiveLimit, rateLimitResult);

        if (rateLimitResult.IsLimited)
        {
            _logger.LogWarning(
                "Rate limit exceeded for {ClientIdentifier} on {Path}. Limit: {Limit}, Current: {Current}",
                clientIdentifier, context.Request.Path, effectiveLimit.RequestsPerWindow, rateLimitResult.CurrentCount);

            await WriteRateLimitExceededResponse(context, effectiveLimit, rateLimitResult);
            return;
        }

        await _next(context);
    }

    private static bool ShouldSkipRateLimiting(PathString path)
    {
        var skipPaths = new[] { "/health", "/ready", "/swagger", "/.well-known" };
        return skipPaths.Any(p => path.StartsWithSegments(p, StringComparison.OrdinalIgnoreCase));
    }

    private static string GetClientIdentifier(HttpContext context, Guid? tenantId)
    {
        if (tenantId.HasValue)
        {
            return $"tenant:{tenantId.Value}";
        }

        var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrEmpty(forwardedFor))
        {
            return $"ip:{forwardedFor.Split(',')[0].Trim()}";
        }

        var realIp = context.Request.Headers["X-Real-IP"].FirstOrDefault();
        if (!string.IsNullOrEmpty(realIp))
        {
            return $"ip:{realIp}";
        }

        return $"ip:{context.Connection.RemoteIpAddress?.ToString() ?? "unknown"}";
    }

    private EndpointRateLimitConfig GetEndpointConfig(PathString path)
    {
        foreach (var (endpoint, config) in _endpointConfigs)
        {
            if (path.StartsWithSegments(endpoint, StringComparison.OrdinalIgnoreCase))
            {
                return config;
            }
        }

        return new EndpointRateLimitConfig
        {
            RequestsPerMinute = _configuration.GetValue("RateLimiting:DefaultRequestsPerMinute", 100),
            BurstLimit = _configuration.GetValue("RateLimiting:DefaultBurstLimit", 20),
            WindowSeconds = 60
        };
    }

    private TenantPlanLimits GetPlanLimits(HttpContext context)
    {
        var plan = "free";
        if (context.Items.TryGetValue("TenantPlan", out var planObj) && planObj != null)
        {
            plan = planObj.ToString()?.ToLowerInvariant() ?? "free";
        }

        return _planLimits.GetValueOrDefault(plan, _planLimits["free"]);
    }

    private static EffectiveRateLimit CalculateEffectiveLimit(EndpointRateLimitConfig endpointConfig, TenantPlanLimits planLimits)
    {
        var adjustedRequests = (int)Math.Min(
            endpointConfig.RequestsPerMinute * planLimits.BaseMultiplier,
            planLimits.MaxRequestsPerMinute);

        var adjustedBurst = (int)Math.Min(
            endpointConfig.BurstLimit * planLimits.BaseMultiplier,
            planLimits.MaxBurst);

        return new EffectiveRateLimit
        {
            RequestsPerWindow = adjustedRequests,
            BurstLimit = adjustedBurst,
            WindowSeconds = endpointConfig.WindowSeconds
        };
    }

    private static string BuildRateLimitKey(string clientIdentifier, PathString path)
    {
        var pathSegments = path.Value?.Split('/').Take(4).Where(s => !string.IsNullOrEmpty(s));
        var normalizedPath = pathSegments != null ? string.Join("/", pathSegments) : "default";
        return $"{clientIdentifier}:{normalizedPath}";
    }

    private RateLimitResult CheckRateLimit(string key, EffectiveRateLimit limits)
    {
        var now = DateTime.UtcNow;
        var windowStart = now.AddSeconds(-limits.WindowSeconds);

        var entry = _rateLimitStore.AddOrUpdate(
            key,
            _ => new RateLimitEntry
            {
                Timestamps = new List<DateTime> { now },
                WindowStart = now
            },
            (_, existing) =>
            {
                lock (existing)
                {
                    existing.Timestamps.RemoveAll(t => t < windowStart);
                    existing.Timestamps.Add(now);
                    existing.WindowStart = windowStart;
                }
                return existing;
            });

        int currentCount;
        int burstCount;
        DateTime resetTime;

        lock (entry)
        {
            currentCount = entry.Timestamps.Count;
            burstCount = entry.Timestamps.Count(t => (now - t).TotalSeconds < 1);
            resetTime = entry.Timestamps.Count > 0
                ? entry.Timestamps.Min().AddSeconds(limits.WindowSeconds)
                : now.AddSeconds(limits.WindowSeconds);
        }

        var isLimited = currentCount > limits.RequestsPerWindow || burstCount > limits.BurstLimit;

        return new RateLimitResult
        {
            IsLimited = isLimited,
            CurrentCount = currentCount,
            BurstCount = burstCount,
            ResetTime = resetTime,
            LimitReason = burstCount > limits.BurstLimit ? "burst" : "window"
        };
    }

    private static void SetRateLimitHeaders(HttpContext context, EffectiveRateLimit limits, RateLimitResult result)
    {
        var remaining = Math.Max(0, limits.RequestsPerWindow - result.CurrentCount);
        var resetEpoch = new DateTimeOffset(result.ResetTime).ToUnixTimeSeconds();

        context.Response.Headers["X-RateLimit-Limit"] = limits.RequestsPerWindow.ToString();
        context.Response.Headers["X-RateLimit-Remaining"] = remaining.ToString();
        context.Response.Headers["X-RateLimit-Reset"] = resetEpoch.ToString();
        context.Response.Headers["X-RateLimit-Burst-Limit"] = limits.BurstLimit.ToString();
        context.Response.Headers["X-RateLimit-Window"] = limits.WindowSeconds.ToString();
    }

    private static async Task WriteRateLimitExceededResponse(HttpContext context, EffectiveRateLimit limits, RateLimitResult result)
    {
        context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
        context.Response.ContentType = "application/json";

        var retryAfter = (int)(result.ResetTime - DateTime.UtcNow).TotalSeconds;
        context.Response.Headers["Retry-After"] = Math.Max(1, retryAfter).ToString();

        var response = JsonSerializer.Serialize(new
        {
            errorCode = "RATE_LIMIT_EXCEEDED",
            errorMessage = result.LimitReason == "burst"
                ? "Too many requests in a short period. Please slow down."
                : "Rate limit exceeded. Please wait before retrying.",
            limit = limits.RequestsPerWindow,
            burstLimit = limits.BurstLimit,
            windowSeconds = limits.WindowSeconds,
            current = result.CurrentCount,
            remaining = 0,
            retryAfter = Math.Max(1, retryAfter),
            resetAt = result.ResetTime.ToString("O")
        });

        await context.Response.WriteAsync(response);
    }

    private class EndpointRateLimitConfig
    {
        public int RequestsPerMinute { get; set; }
        public int BurstLimit { get; set; }
        public int WindowSeconds { get; set; }
    }

    private class TenantPlanLimits
    {
        public double BaseMultiplier { get; set; }
        public int MaxRequestsPerMinute { get; set; }
        public int MaxBurst { get; set; }
    }

    private class EffectiveRateLimit
    {
        public int RequestsPerWindow { get; set; }
        public int BurstLimit { get; set; }
        public int WindowSeconds { get; set; }
    }

    private class RateLimitEntry
    {
        public List<DateTime> Timestamps { get; set; } = new();
        public DateTime WindowStart { get; set; }
    }

    private class RateLimitResult
    {
        public bool IsLimited { get; set; }
        public int CurrentCount { get; set; }
        public int BurstCount { get; set; }
        public DateTime ResetTime { get; set; }
        public string LimitReason { get; set; } = "window";
    }
}
