using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Extensibility.Domain.Entities;
using Onesign.Modules.Extensibility.Domain.Enums;
using Onesign.Modules.Extensibility.Domain.Repositories;
using Onesign.Modules.Extensibility.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Extensibility.Infrastructure.EfCore.Repositories;

public class WebhookDeliveryLogRepository : IWebhookDeliveryLogRepository
{
    private readonly DbContext _dbContext;

    public WebhookDeliveryLogRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<WebhookDeliveryLog?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<WebhookDeliveryLogEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, ct);
        return entity == null ? null : MapToDomain(entity);
    }

    public async Task<IReadOnlyList<WebhookDeliveryLog>> GetBySubscriptionIdAsync(Guid subscriptionId, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<WebhookDeliveryLogEntity>()
            .Where(x => x.SubscriptionId == subscriptionId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<WebhookDeliveryLog>> GetByTenantIdAsync(Guid tenantId, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<WebhookDeliveryLogEntity>()
            .Where(x => x.TenantId == tenantId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<WebhookDeliveryLog>> GetByTenantIdAsync(Guid tenantId, int limit, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<WebhookDeliveryLogEntity>()
            .Where(x => x.TenantId == tenantId)
            .OrderByDescending(x => x.CreatedAt)
            .Take(limit)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<WebhookDeliveryLog>> GetByStatusAsync(Guid tenantId, WebhookDeliveryStatus status, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<WebhookDeliveryLogEntity>()
            .Where(x => x.TenantId == tenantId && x.Status == (int)status)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<WebhookDeliveryLog>> GetPendingRetriesAsync(Guid tenantId, int maxAttempts, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<WebhookDeliveryLogEntity>()
            .Where(x => x.TenantId == tenantId &&
                        (x.Status == (int)WebhookDeliveryStatus.Pending || x.Status == (int)WebhookDeliveryStatus.Retrying) &&
                        x.AttemptCount < maxAttempts)
            .OrderBy(x => x.CreatedAt)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<WebhookDeliveryLog>> GetPendingDeliveriesAsync(int batchSize, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<WebhookDeliveryLogEntity>()
            .Where(x => x.Status == (int)WebhookDeliveryStatus.Pending || x.Status == (int)WebhookDeliveryStatus.Retrying)
            .OrderBy(x => x.CreatedAt)
            .Take(batchSize)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task AddAsync(WebhookDeliveryLog log, CancellationToken ct = default)
    {
        var entity = MapToEntity(log);
        await _dbContext.Set<WebhookDeliveryLogEntity>().AddAsync(entity, ct);
        await _dbContext.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(WebhookDeliveryLog log, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<WebhookDeliveryLogEntity>()
            .FirstOrDefaultAsync(x => x.Id == log.Id, ct);
        if (entity != null)
        {
            entity.Status = (int)log.Status;
            entity.AttemptCount = log.AttemptCount;
            entity.LastAttemptAt = log.LastAttemptAt;
            entity.ResponseStatusCode = log.ResponseStatusCode;
            entity.ErrorMessage = log.ErrorMessage;
            await _dbContext.SaveChangesAsync(ct);
        }
    }

    private static WebhookDeliveryLog MapToDomain(WebhookDeliveryLogEntity entity) => new()
    {
        Id = entity.Id,
        SubscriptionId = entity.SubscriptionId,
        TenantId = entity.TenantId,
        EventType = entity.EventType,
        PayloadJson = entity.PayloadJson,
        Status = (WebhookDeliveryStatus)entity.Status,
        AttemptCount = entity.AttemptCount,
        LastAttemptAt = entity.LastAttemptAt,
        ResponseStatusCode = entity.ResponseStatusCode,
        ErrorMessage = entity.ErrorMessage,
        CreatedAt = entity.CreatedAt
    };

    private static WebhookDeliveryLogEntity MapToEntity(WebhookDeliveryLog log) => new()
    {
        Id = log.Id,
        SubscriptionId = log.SubscriptionId,
        TenantId = log.TenantId,
        EventType = log.EventType,
        PayloadJson = log.PayloadJson,
        Status = (int)log.Status,
        AttemptCount = log.AttemptCount,
        LastAttemptAt = log.LastAttemptAt,
        ResponseStatusCode = log.ResponseStatusCode,
        ErrorMessage = log.ErrorMessage,
        CreatedAt = log.CreatedAt
    };
}
