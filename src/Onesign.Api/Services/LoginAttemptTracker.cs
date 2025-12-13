using System.Collections.Concurrent;

namespace Onesign.Api.Services;

/// <summary>
/// Tracks login attempts and manages lockouts for IP addresses based on failed login attempts.
/// Implements a sliding window approach for both rate limiting and lockout mechanisms.
/// </summary>
public interface ILoginAttemptTracker
{
    /// <summary>
    /// Records a failed login attempt for the given IP address
    /// </summary>
    void RecordFailedAttempt(string ipAddress);

    /// <summary>
    /// Checks if the IP address is currently locked out
    /// </summary>
    bool IsLockedOut(string ipAddress);

    /// <summary>
    /// Gets the remaining lockout time for an IP address
    /// </summary>
    TimeSpan GetRemainingLockoutTime(string ipAddress);

    /// <summary>
    /// Clears failed attempts for an IP address (called on successful login)
    /// </summary>
    void ClearFailedAttempts(string ipAddress);

    /// <summary>
    /// Gets the number of failed attempts for an IP address in the tracking window
    /// </summary>
    int GetFailedAttemptCount(string ipAddress);
}

public class LoginAttemptTracker : ILoginAttemptTracker
{
    private readonly ConcurrentDictionary<string, LoginAttemptInfo> _attemptStore = new();
    private readonly ILogger<LoginAttemptTracker> _logger;
    private readonly LoginLockoutOptions _options;

    // Timer to periodically clean up old entries
    private readonly Timer _cleanupTimer;

    public LoginAttemptTracker(ILogger<LoginAttemptTracker> logger, LoginLockoutOptions options)
    {
        _logger = logger;
        _options = options;

        // Run cleanup every 5 minutes
        _cleanupTimer = new Timer(CleanupOldEntries, null, TimeSpan.FromMinutes(5), TimeSpan.FromMinutes(5));
    }

    public void RecordFailedAttempt(string ipAddress)
    {
        var now = DateTime.UtcNow;
        var trackingWindow = now.AddMinutes(-_options.TrackingWindowMinutes);

        var info = _attemptStore.AddOrUpdate(
            ipAddress,
            _ => new LoginAttemptInfo
            {
                FailedAttempts = new List<DateTime> { now }
            },
            (_, existing) =>
            {
                lock (existing)
                {
                    // Remove attempts outside the tracking window
                    existing.FailedAttempts.RemoveAll(t => t < trackingWindow);

                    // Add new failed attempt
                    existing.FailedAttempts.Add(now);

                    // Check if we should lock out this IP
                    if (existing.FailedAttempts.Count >= _options.MaxFailedAttempts && existing.LockoutUntil == null)
                    {
                        existing.LockoutUntil = now.AddMinutes(_options.LockoutDurationMinutes);
                        _logger.LogWarning(
                            "IP address {IpAddress} locked out until {LockoutUntil} after {FailedAttempts} failed attempts",
                            ipAddress, existing.LockoutUntil, existing.FailedAttempts.Count);
                    }
                }
                return existing;
            });

        _logger.LogInformation(
            "Failed login attempt recorded for IP {IpAddress}. Total attempts in window: {Count}",
            ipAddress, info.FailedAttempts.Count);
    }

    public bool IsLockedOut(string ipAddress)
    {
        if (!_attemptStore.TryGetValue(ipAddress, out var info))
        {
            return false;
        }

        lock (info)
        {
            if (info.LockoutUntil == null)
            {
                return false;
            }

            // Check if lockout has expired
            if (DateTime.UtcNow >= info.LockoutUntil)
            {
                info.LockoutUntil = null;
                info.FailedAttempts.Clear();
                _logger.LogInformation("Lockout expired for IP address {IpAddress}", ipAddress);
                return false;
            }

            return true;
        }
    }

    public TimeSpan GetRemainingLockoutTime(string ipAddress)
    {
        if (!_attemptStore.TryGetValue(ipAddress, out var info))
        {
            return TimeSpan.Zero;
        }

        lock (info)
        {
            if (info.LockoutUntil == null || DateTime.UtcNow >= info.LockoutUntil)
            {
                return TimeSpan.Zero;
            }

            return info.LockoutUntil.Value - DateTime.UtcNow;
        }
    }

    public void ClearFailedAttempts(string ipAddress)
    {
        if (_attemptStore.TryGetValue(ipAddress, out var info))
        {
            lock (info)
            {
                info.FailedAttempts.Clear();
                info.LockoutUntil = null;
            }
            _logger.LogInformation("Cleared failed attempts for IP address {IpAddress}", ipAddress);
        }
    }

    public int GetFailedAttemptCount(string ipAddress)
    {
        if (!_attemptStore.TryGetValue(ipAddress, out var info))
        {
            return 0;
        }

        var now = DateTime.UtcNow;
        var trackingWindow = now.AddMinutes(-_options.TrackingWindowMinutes);

        lock (info)
        {
            // Remove old attempts
            info.FailedAttempts.RemoveAll(t => t < trackingWindow);
            return info.FailedAttempts.Count;
        }
    }

    private void CleanupOldEntries(object? state)
    {
        try
        {
            var now = DateTime.UtcNow;
            var keysToRemove = new List<string>();

            foreach (var kvp in _attemptStore)
            {
                var info = kvp.Value;
                lock (info)
                {
                    // Remove entries that have no failed attempts and no active lockout
                    var oldestRelevantTime = now.AddMinutes(-_options.TrackingWindowMinutes * 2);
                    var hasRecentActivity = info.FailedAttempts.Any(t => t > oldestRelevantTime);
                    var hasActiveLockout = info.LockoutUntil != null && info.LockoutUntil > now;

                    if (!hasRecentActivity && !hasActiveLockout)
                    {
                        keysToRemove.Add(kvp.Key);
                    }
                }
            }

            foreach (var key in keysToRemove)
            {
                _attemptStore.TryRemove(key, out _);
            }

            if (keysToRemove.Count > 0)
            {
                _logger.LogInformation("Cleaned up {Count} old login attempt entries", keysToRemove.Count);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login attempt cleanup");
        }
    }

    private class LoginAttemptInfo
    {
        public List<DateTime> FailedAttempts { get; set; } = new();
        public DateTime? LockoutUntil { get; set; }
    }
}

/// <summary>
/// Configuration options for login lockout mechanism
/// </summary>
public class LoginLockoutOptions
{
    /// <summary>
    /// Maximum number of failed login attempts before lockout
    /// Default: 10
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
