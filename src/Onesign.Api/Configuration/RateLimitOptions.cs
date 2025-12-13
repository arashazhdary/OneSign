namespace Onesign.Api.Configuration;

/// <summary>
/// Configuration options for rate limiting across the application
/// </summary>
public class RateLimitOptions
{
    public const string SectionName = "RateLimit";

    /// <summary>
    /// Basic rate limit: Maximum requests per minute per IP address
    /// Default: 5 requests per minute
    /// </summary>
    public int MaxRequestsPerMinute { get; set; } = 5;

    /// <summary>
    /// Time window for rate limiting in minutes
    /// Default: 1 minute
    /// </summary>
    public int WindowMinutes { get; set; } = 1;

    /// <summary>
    /// Lockout configuration
    /// </summary>
    public LockoutOptions Lockout { get; set; } = new();
}

/// <summary>
/// Configuration for account lockout after failed login attempts
/// </summary>
public class LockoutOptions
{
    /// <summary>
    /// Maximum number of failed login attempts before lockout
    /// Default: 10 attempts
    /// </summary>
    public int MaxFailedAttempts { get; set; } = 10;

    /// <summary>
    /// Time window in minutes to track failed attempts
    /// Default: 15 minutes
    /// </summary>
    public int TrackingWindowMinutes { get; set; } = 15;

    /// <summary>
    /// Duration of lockout in minutes after max failed attempts reached
    /// Default: 30 minutes
    /// </summary>
    public int LockoutDurationMinutes { get; set; } = 30;
}
