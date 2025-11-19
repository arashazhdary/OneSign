using Onesign.Modules.Extensibility.Domain.Entities;

namespace Onesign.Modules.Extensibility.Domain.Repositories;

public interface IWebhookSubscriptionRepository
{
    Task<WebhookSubscription?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<WebhookSubscription>> GetByTenantIdAsync(Guid tenantId, CancellationToken ct = default);
    Task<IReadOnlyList<WebhookSubscription>> GetEnabledByTenantIdAsync(Guid tenantId, CancellationToken ct = default);
    Task<IReadOnlyList<WebhookSubscription>> GetByEventTypeAsync(Guid tenantId, string eventType, CancellationToken ct = default);
    Task AddAsync(WebhookSubscription subscription, CancellationToken ct = default);
    Task UpdateAsync(WebhookSubscription subscription, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
