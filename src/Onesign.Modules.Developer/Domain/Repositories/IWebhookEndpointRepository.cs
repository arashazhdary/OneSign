using Onesign.Modules.Developer.Domain.Entities;

namespace Onesign.Modules.Developer.Domain.Repositories;

public interface IWebhookEndpointRepository
{
    Task<WebhookEndpoint?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<WebhookEndpoint>> GetByTenantIdAsync(Guid tenantId, bool? enabledOnly = null, CancellationToken cancellationToken = default);
    Task<List<WebhookEndpoint>> GetByEventTypeAsync(Guid tenantId, string eventType, CancellationToken cancellationToken = default);
    Task<WebhookEndpoint> AddAsync(WebhookEndpoint webhook, CancellationToken cancellationToken = default);
    Task UpdateAsync(WebhookEndpoint webhook, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
