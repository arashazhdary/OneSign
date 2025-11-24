using Microsoft.Extensions.Logging;

namespace Onesign.Shared.Email;

/// <summary>
/// Null implementation of IEmailService that does not send emails.
/// Used as a fallback when SMTP is not configured.
/// </summary>
public class NullEmailService : IEmailService
{
    private readonly ILogger<NullEmailService> _logger;

    public NullEmailService(ILogger<NullEmailService> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Does not send an email, but logs a warning.
    /// </summary>
    public Task<bool> SendEmailAsync(
        string to,
        string subject,
        string body,
        bool isHtml = true,
        CancellationToken cancellationToken = default)
    {
        _logger.LogWarning(
            "Email service is not configured. Email not sent to {To} with subject '{Subject}'",
            to,
            subject);

        return Task.FromResult(false);
    }

    /// <summary>
    /// Does not send an email, but logs a warning.
    /// </summary>
    public Task<bool> SendEmailAsync(
        string to,
        string toDisplayName,
        string subject,
        string body,
        bool isHtml = true,
        CancellationToken cancellationToken = default)
    {
        _logger.LogWarning(
            "Email service is not configured. Email not sent to {ToDisplayName} <{To}> with subject '{Subject}'",
            toDisplayName,
            to,
            subject);

        return Task.FromResult(false);
    }
}
