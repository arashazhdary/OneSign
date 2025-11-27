using Microsoft.Extensions.Logging;

namespace Onesign.Shared.Push;

/// <summary>
/// Null implementation of IPushNotificationService that does not send push notifications.
/// Used as a fallback when push notification provider is not configured.
/// </summary>
public class NullPushNotificationService : IPushNotificationService
{
    private readonly ILogger<NullPushNotificationService> _logger;

    public NullPushNotificationService(ILogger<NullPushNotificationService> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Does not send a push notification, but logs a warning.
    /// </summary>
    public Task<bool> SendPushNotificationAsync(
        string userId,
        string title,
        string body,
        Dictionary<string, string>? data = null,
        CancellationToken cancellationToken = default)
    {
        _logger.LogWarning(
            "Push notification service is not configured. Push notification not sent to user {UserId} with title '{Title}'",
            userId,
            title);

        return Task.FromResult(false);
    }

    /// <summary>
    /// Does not send a push notification, but logs a warning.
    /// </summary>
    public Task<bool> SendPushNotificationByTokenAsync(
        string deviceToken,
        string title,
        string body,
        Dictionary<string, string>? data = null,
        CancellationToken cancellationToken = default)
    {
        _logger.LogWarning(
            "Push notification service is not configured. Push notification not sent to device token {DeviceToken} with title '{Title}'",
            deviceToken?.Substring(0, Math.Min(10, deviceToken?.Length ?? 0)),
            title);

        return Task.FromResult(false);
    }
}
