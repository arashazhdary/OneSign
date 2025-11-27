namespace Onesign.Shared.Sms;

/// <summary>
/// SMS service interface for sending SMS messages.
/// </summary>
public interface ISmsService
{
    /// <summary>
    /// Sends an SMS message asynchronously.
    /// </summary>
    /// <param name="to">Recipient phone number (E.164 format recommended)</param>
    /// <param name="message">SMS message body</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if SMS was sent successfully, false otherwise</returns>
    Task<bool> SendSmsAsync(
        string to,
        string message,
        CancellationToken cancellationToken = default);
}
