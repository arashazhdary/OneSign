using System.Collections.Concurrent;
using System.Net;

namespace Onesign.Api.Middleware;

public class RateLimitMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ConcurrentDictionary<string, RateLimitInfo> _rateLimitStore = new();
    private readonly TimeSpan _window = TimeSpan.FromMinutes(1);
    private readonly int _maxRequests = 5;

    public RateLimitMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Only apply rate limiting to login endpoints
        if (context.Request.Path.StartsWithSegments("/api/auth/login") ||
            context.Request.Path.StartsWithSegments("/api/auth/google-login"))
        {
            var clientIp = GetClientIp(context);
            var key = $"{clientIp}:{context.Request.Path}";

            var rateLimitInfo = _rateLimitStore.GetOrAdd(key, _ => new RateLimitInfo());

            // Clean old entries and check limit
            bool shouldBlock = false;
            lock (rateLimitInfo)
            {
                // Clean old entries
                if (DateTime.UtcNow - rateLimitInfo.WindowStart > _window)
                {
                    rateLimitInfo.Count = 0;
                    rateLimitInfo.WindowStart = DateTime.UtcNow;
                }

                // Check if limit exceeded
                if (rateLimitInfo.Count >= _maxRequests)
                {
                    shouldBlock = true;
                }
                else
                {
                    rateLimitInfo.Count++;
                }
            }

            if (shouldBlock)
            {
                context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
                context.Response.ContentType = "application/json";
                var response = System.Text.Json.JsonSerializer.Serialize(new
                {
                    errorCode = "RATE_LIMIT_EXCEEDED",
                    errorMessage = "Too many requests. Please try again later."
                });
                await context.Response.WriteAsync(response);
                return;
            }
        }

        await _next(context);
    }

    private static string GetClientIp(HttpContext context)
    {
        // Check for forwarded IP first
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

    private class RateLimitInfo
    {
        public int Count { get; set; }
        public DateTime WindowStart { get; set; } = DateTime.UtcNow;
    }
}
