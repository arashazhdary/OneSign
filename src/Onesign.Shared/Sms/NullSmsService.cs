using Microsoft.Extensions.Logging;

namespace Onesign.Shared.Sms;

/// <summary>
/// Null implementation of ISmsService that does not send SMS messages.
/// Used as a fallback when SMS provider is not configured.
/// </summary>
public class NullSmsService : ISmsService
{
    private readonly ILogger<NullSmsService> _logger;

    public NullSmsService(ILogger<NullSmsService> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Does not send an SMS, but logs a warning.
    /// </summary>
    public Task<bool> SendSmsAsync(
        string to,
        string message,
        CancellationToken cancellationToken = default)
    {
        _logger.LogWarning(
            "SMS service is not configured. SMS not sent to {To} with message: {Message}",
            to,
            message?.Substring(0, Math.Min(50, message?.Length ?? 0)));

        return Task.FromResult(false);
    }
}
