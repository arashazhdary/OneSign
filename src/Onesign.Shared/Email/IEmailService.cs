namespace Onesign.Shared.Email;

/// <summary>
/// Email service interface for sending emails.
/// </summary>
public interface IEmailService
{
    /// <summary>
    /// Sends an email asynchronously.
    /// </summary>
    /// <param name="to">Recipient email address</param>
    /// <param name="subject">Email subject</param>
    /// <param name="body">Email body (HTML or plain text)</param>
    /// <param name="isHtml">Whether the body is HTML (default: true)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if email was sent successfully, false otherwise</returns>
    Task<bool> SendEmailAsync(
        string to,
        string subject,
        string body,
        bool isHtml = true,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends an email with a display name for the recipient.
    /// </summary>
    Task<bool> SendEmailAsync(
        string to,
        string toDisplayName,
        string subject,
        string body,
        bool isHtml = true,
        CancellationToken cancellationToken = default);
}

