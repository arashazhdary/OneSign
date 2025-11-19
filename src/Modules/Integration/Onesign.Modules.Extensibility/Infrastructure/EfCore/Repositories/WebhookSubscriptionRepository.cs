using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Extensibility.Domain.Entities;
using Onesign.Modules.Extensibility.Domain.Repositories;
using Onesign.Modules.Extensibility.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Extensibility.Infrastructure.EfCore.Repositories;

public class WebhookSubscriptionRepository : IWebhookSubscriptionRepository
{
    private readonly DbContext _dbContext;

    public WebhookSubscriptionRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<WebhookSubscription?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<WebhookSubscriptionEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, ct);
        return entity == null ? null : MapToDomain(entity);
    }

    public async Task<IReadOnlyList<WebhookSubscription>> GetByTenantIdAsync(Guid tenantId, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<WebhookSubscriptionEntity>()
            .Where(x => x.TenantId == tenantId)
            .OrderBy(x => x.Name)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<WebhookSubscription>> GetEnabledByTenantIdAsync(Guid tenantId, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<WebhookSubscriptionEntity>()
            .Where(x => x.TenantId == tenantId && x.IsEnabled)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<WebhookSubscription>> GetByEventTypeAsync(Guid tenantId, string eventType, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<WebhookSubscriptionEntity>()
            .Where(x => x.TenantId == tenantId && x.IsEnabled && x.EventTypesJson.Contains(eventType))
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task AddAsync(WebhookSubscription subscription, CancellationToken ct = default)
    {
        var entity = MapToEntity(subscription);
        await _dbContext.Set<WebhookSubscriptionEntity>().AddAsync(entity, ct);
        await _dbContext.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(WebhookSubscription subscription, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<WebhookSubscriptionEntity>()
            .FirstOrDefaultAsync(x => x.Id == subscription.Id, ct);
        if (entity != null)
        {
            entity.Name = subscription.Name;
            entity.EndpointUrl = subscription.EndpointUrl;
            entity.Secret = subscription.Secret;
            entity.EventTypesJson = subscription.EventTypesJson;
            entity.IsEnabled = subscription.IsEnabled;
            entity.MaxRetries = subscription.MaxRetries;
            entity.LastDeliveryAt = subscription.LastDeliveryAt;
            entity.LastDeliveryStatus = subscription.LastDeliveryStatus;
            await _dbContext.SaveChangesAsync(ct);
        }
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<WebhookSubscriptionEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity != null)
        {
            _dbContext.Set<WebhookSubscriptionEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(ct);
        }
    }

    private static WebhookSubscription MapToDomain(WebhookSubscriptionEntity entity) => new()
    {
        Id = entity.Id,
        TenantId = entity.TenantId,
        Name = entity.Name,
        EndpointUrl = entity.EndpointUrl,
        Secret = entity.Secret,
        EventTypesJson = entity.EventTypesJson,
        IsEnabled = entity.IsEnabled,
        MaxRetries = entity.MaxRetries,
        CreatedAt = entity.CreatedAt,
        LastDeliveryAt = entity.LastDeliveryAt,
        LastDeliveryStatus = entity.LastDeliveryStatus
    };

    private static WebhookSubscriptionEntity MapToEntity(WebhookSubscription subscription) => new()
    {
        Id = subscription.Id,
        TenantId = subscription.TenantId,
        Name = subscription.Name,
        EndpointUrl = subscription.EndpointUrl,
        Secret = subscription.Secret,
        EventTypesJson = subscription.EventTypesJson,
        IsEnabled = subscription.IsEnabled,
        MaxRetries = subscription.MaxRetries,
        CreatedAt = subscription.CreatedAt,
        LastDeliveryAt = subscription.LastDeliveryAt,
        LastDeliveryStatus = subscription.LastDeliveryStatus
    };
}
