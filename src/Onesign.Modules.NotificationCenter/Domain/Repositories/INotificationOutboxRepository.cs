using Onesign.Modules.NotificationCenter.Domain.Entities;
using Onesign.Modules.NotificationCenter.Domain.Enums;

namespace Onesign.Modules.NotificationCenter.Domain.Repositories;

public interface INotificationOutboxRepository
{
    Task<NotificationOutboxItem?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<NotificationOutboxItem>> GetPendingAsync(int limit, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<NotificationOutboxItem>> GetByRecipientAsync(Guid tenantId, Guid recipientUserId, CancellationToken cancellationToken = default);
    Task AddAsync(NotificationOutboxItem item, CancellationToken cancellationToken = default);
    Task UpdateAsync(NotificationOutboxItem item, CancellationToken cancellationToken = default);
}
