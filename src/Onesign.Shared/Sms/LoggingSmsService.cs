using Microsoft.Extensions.Logging;

namespace Onesign.Shared.Sms;

/// <summary>
/// Development-friendly SMS provider: logs the message and reports success (no external provider).
/// </summary>
public class LoggingSmsService : ISmsService
{
    private readonly ILogger<LoggingSmsService> _logger;

    public LoggingSmsService(ILogger<LoggingSmsService> logger)
    {
        _logger = logger;
    }

    public Task<bool> SendSmsAsync(
        string to,
        string message,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "[DEV SMS] To={To} Message={Message}",
            to,
            message);

        return Task.FromResult(true);
    }
}
