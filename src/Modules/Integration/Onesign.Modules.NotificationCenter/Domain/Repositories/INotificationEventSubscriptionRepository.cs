using Onesign.Modules.NotificationCenter.Domain.Entities;

namespace Onesign.Modules.NotificationCenter.Domain.Repositories;

public interface INotificationEventSubscriptionRepository
{
    Task<NotificationEventSubscription?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<NotificationEventSubscription>> GetByEventTypeAsync(Guid tenantId, string eventType, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<NotificationEventSubscription>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task AddAsync(NotificationEventSubscription subscription, CancellationToken cancellationToken = default);
    Task UpdateAsync(NotificationEventSubscription subscription, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
