using System.Net;
using System.Text.Json;
using Onesign.Api.Services;

namespace Onesign.Api.Middleware;

/// <summary>
/// Middleware that enforces lockouts for IP addresses that have exceeded the maximum number of failed login attempts.
/// This middleware should be placed early in the pipeline to prevent locked-out IPs from reaching the login endpoint.
/// </summary>
public class LoginLockoutMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<LoginLockoutMiddleware> _logger;

    public LoginLockoutMiddleware(RequestDelegate next, ILogger<LoginLockoutMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, ILoginAttemptTracker attemptTracker)
    {
        // Only check lockout for login endpoints
        if (IsLoginEndpoint(context.Request.Path))
        {
            var clientIp = GetClientIp(context);

            if (attemptTracker.IsLockedOut(clientIp))
            {
                var remainingTime = attemptTracker.GetRemainingLockoutTime(clientIp);
                var failedAttempts = attemptTracker.GetFailedAttemptCount(clientIp);

                _logger.LogWarning(
                    "Blocked login attempt from locked-out IP {IpAddress}. Remaining lockout time: {RemainingTime}",
                    clientIp, remainingTime);

                context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
                context.Response.ContentType = "application/json";

                var retryAfter = (int)remainingTime.TotalSeconds;
                context.Response.Headers["Retry-After"] = Math.Max(1, retryAfter).ToString();

                var response = JsonSerializer.Serialize(new
                {
                    errorCode = "ACCOUNT_TEMPORARILY_LOCKED",
                    errorMessage = $"Too many failed login attempts. Account is temporarily locked. Please try again in {remainingTime.Minutes} minutes and {remainingTime.Seconds} seconds.",
                    retryAfter = Math.Max(1, retryAfter),
                    lockoutExpiresAt = DateTime.UtcNow.Add(remainingTime).ToString("O"),
                    failedAttempts = failedAttempts
                });

                await context.Response.WriteAsync(response);
                return;
            }
        }

        await _next(context);
    }

    private static bool IsLoginEndpoint(PathString path)
    {
        return path.StartsWithSegments("/api/auth/login", StringComparison.OrdinalIgnoreCase) ||
               path.StartsWithSegments("/api/auth/google-login", StringComparison.OrdinalIgnoreCase);
    }

    private static string GetClientIp(HttpContext context)
    {
        // Check for forwarded IP first (when behind proxy/load balancer)
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
}
