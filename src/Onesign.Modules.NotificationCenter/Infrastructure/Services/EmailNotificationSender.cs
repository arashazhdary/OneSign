using Microsoft.Extensions.Logging;
using Onesign.Modules.NotificationCenter.Domain.Entities;
using Onesign.Modules.NotificationCenter.Domain.Enums;
using Onesign.Modules.NotificationCenter.Domain.Services;
using Onesign.Shared.Email;

namespace Onesign.Modules.NotificationCenter.Infrastructure.Services;

public class EmailNotificationSender : INotificationSender
{
    private readonly IEmailService _emailService;
    private readonly ILogger<EmailNotificationSender> _logger;

    public EmailNotificationSender(IEmailService emailService, ILogger<EmailNotificationSender> logger)
    {
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<bool> SendAsync(NotificationOutboxItem item, CancellationToken cancellationToken = default)
    {
        if (item.Channel != NotificationChannel.Email)
        {
            _logger.LogWarning("EmailNotificationSender received non-email notification: {NotificationId}", item.Id);
            return false;
        }

        try
        {
            await _emailService.SendAsync(
                item.RecipientAddress,
                item.Subject,
                item.Body,
                isHtml: true,
                cancellationToken);

            _logger.LogInformation("Email notification sent successfully: {NotificationId} to {Recipient}",
                item.Id, item.RecipientAddress);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email notification: {NotificationId} to {Recipient}",
                item.Id, item.RecipientAddress);
            return false;
        }
    }
}
