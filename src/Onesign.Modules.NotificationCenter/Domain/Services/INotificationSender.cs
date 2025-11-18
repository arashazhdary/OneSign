using Onesign.Modules.NotificationCenter.Domain.Entities;

namespace Onesign.Modules.NotificationCenter.Domain.Services;

public interface INotificationSender
{
    Task<bool> SendAsync(NotificationOutboxItem item, CancellationToken cancellationToken = default);
}
