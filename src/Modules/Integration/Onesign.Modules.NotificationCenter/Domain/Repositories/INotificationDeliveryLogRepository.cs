using Onesign.Modules.NotificationCenter.Domain.Entities;
using Onesign.Modules.NotificationCenter.Domain.Enums;

namespace Onesign.Modules.NotificationCenter.Domain.Repositories;

public interface INotificationDeliveryLogRepository
{
    Task<NotificationDeliveryLog?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<NotificationDeliveryLog>> GetByOutboxItemIdAsync(Guid outboxItemId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<NotificationDeliveryLog>> GetByTenantIdAsync(Guid tenantId, int skip, int take, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<NotificationDeliveryLog>> GetFilteredAsync(
        Guid tenantId,
        NotificationChannel? channel,
        DeliveryStatus? status,
        DateTime? fromDate,
        DateTime? toDate,
        int skip,
        int take,
        CancellationToken cancellationToken = default);
    Task<int> GetCountAsync(
        Guid tenantId,
        NotificationChannel? channel,
        DeliveryStatus? status,
        DateTime? fromDate,
        DateTime? toDate,
        CancellationToken cancellationToken = default);
    Task AddAsync(NotificationDeliveryLog log, CancellationToken cancellationToken = default);
}
