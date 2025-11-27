namespace Onesign.Shared.Push;

/// <summary>
/// Push notification service interface for sending push notifications.
/// </summary>
public interface IPushNotificationService
{
    /// <summary>
    /// Sends a push notification asynchronously.
    /// </summary>
    /// <param name="userId">Target user ID</param>
    /// <param name="title">Notification title</param>
    /// <param name="body">Notification body</param>
    /// <param name="data">Additional data payload (optional)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if push notification was sent successfully, false otherwise</returns>
    Task<bool> SendPushNotificationAsync(
        string userId,
        string title,
        string body,
        Dictionary<string, string>? data = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a push notification to a specific device token.
    /// </summary>
    /// <param name="deviceToken">Device FCM/APNS token</param>
    /// <param name="title">Notification title</param>
    /// <param name="body">Notification body</param>
    /// <param name="data">Additional data payload (optional)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if push notification was sent successfully, false otherwise</returns>
    Task<bool> SendPushNotificationByTokenAsync(
        string deviceToken,
        string title,
        string body,
        Dictionary<string, string>? data = null,
        CancellationToken cancellationToken = default);
}
