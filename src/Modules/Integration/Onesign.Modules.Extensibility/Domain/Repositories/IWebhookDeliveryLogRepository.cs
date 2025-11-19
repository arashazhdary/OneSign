using Onesign.Modules.Extensibility.Domain.Entities;
using Onesign.Modules.Extensibility.Domain.Enums;

namespace Onesign.Modules.Extensibility.Domain.Repositories;

public interface IWebhookDeliveryLogRepository
{
    Task<WebhookDeliveryLog?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<WebhookDeliveryLog>> GetBySubscriptionIdAsync(Guid subscriptionId, CancellationToken ct = default);
    Task<IReadOnlyList<WebhookDeliveryLog>> GetByTenantIdAsync(Guid tenantId, CancellationToken ct = default);
    Task<IReadOnlyList<WebhookDeliveryLog>> GetByTenantIdAsync(Guid tenantId, int limit, CancellationToken ct = default);
    Task<IReadOnlyList<WebhookDeliveryLog>> GetByStatusAsync(Guid tenantId, WebhookDeliveryStatus status, CancellationToken ct = default);
    Task<IReadOnlyList<WebhookDeliveryLog>> GetPendingRetriesAsync(Guid tenantId, int maxAttempts, CancellationToken ct = default);
    Task<IReadOnlyList<WebhookDeliveryLog>> GetPendingDeliveriesAsync(int batchSize, CancellationToken ct = default);
    Task AddAsync(WebhookDeliveryLog log, CancellationToken ct = default);
    Task UpdateAsync(WebhookDeliveryLog log, CancellationToken ct = default);
}
