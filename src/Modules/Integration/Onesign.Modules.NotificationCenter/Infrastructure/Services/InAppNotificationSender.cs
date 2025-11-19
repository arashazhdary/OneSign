using Microsoft.Extensions.Logging;
using Onesign.Modules.NotificationCenter.Domain.Entities;
using Onesign.Modules.NotificationCenter.Domain.Enums;
using Onesign.Modules.NotificationCenter.Domain.Services;

namespace Onesign.Modules.NotificationCenter.Infrastructure.Services;

public class InAppNotificationSender : INotificationSender
{
    private readonly ILogger<InAppNotificationSender> _logger;

    public InAppNotificationSender(ILogger<InAppNotificationSender> logger)
    {
        _logger = logger;
    }

    public Task<bool> SendAsync(NotificationOutboxItem item, CancellationToken cancellationToken = default)
    {
        if (item.Channel != NotificationChannel.InApp)
        {
            _logger.LogWarning("InAppNotificationSender received non-InApp notification: {NotificationId}", item.Id);
            return Task.FromResult(false);
        }

        try
        {
            // In-app notifications are stored in the outbox and read directly by clients
            // The notification is considered "sent" once it's in the outbox with InApp channel
            // Clients poll or use SignalR to receive these notifications

            _logger.LogInformation("In-app notification queued successfully: {NotificationId} for user {UserId}",
                item.Id, item.RecipientUserId);

            return Task.FromResult(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to process in-app notification: {NotificationId}", item.Id);
            return Task.FromResult(false);
        }
    }
}
