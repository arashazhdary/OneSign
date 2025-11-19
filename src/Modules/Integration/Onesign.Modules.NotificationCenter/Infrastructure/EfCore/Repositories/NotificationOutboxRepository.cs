using Microsoft.EntityFrameworkCore;
using Onesign.Data.Contexts;
using Onesign.Modules.NotificationCenter.Domain.Entities;
using Onesign.Modules.NotificationCenter.Domain.Enums;
using Onesign.Modules.NotificationCenter.Domain.Repositories;
using Onesign.Modules.NotificationCenter.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.NotificationCenter.Infrastructure.EfCore.Repositories;

public class NotificationOutboxRepository : INotificationOutboxRepository
{
    private readonly OnesignDbContext _dbContext;

    public NotificationOutboxRepository(OnesignDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<NotificationOutboxItem?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<NotificationOutboxItemEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<IReadOnlyList<NotificationOutboxItem>> GetPendingAsync(int limit, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<NotificationOutboxItemEntity>()
            .Where(x => x.Status == (int)DeliveryStatus.Pending && (x.NextRetryAt == null || x.NextRetryAt <= DateTime.UtcNow))
            .OrderBy(x => x.Priority)
            .ThenBy(x => x.CreatedAt)
            .Take(limit)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<NotificationOutboxItem>> GetByRecipientAsync(Guid tenantId, Guid recipientUserId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<NotificationOutboxItemEntity>()
            .Where(x => x.TenantId == tenantId && x.RecipientUserId == recipientUserId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task AddAsync(NotificationOutboxItem item, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(item);
        await _dbContext.Set<NotificationOutboxItemEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(NotificationOutboxItem item, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(item);
        _dbContext.Set<NotificationOutboxItemEntity>().Update(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private static NotificationOutboxItem MapToDomain(NotificationOutboxItemEntity e) => new()
    {
        Id = e.Id,
        TenantId = e.TenantId,
        Channel = (NotificationChannel)e.Channel,
        Priority = (NotificationPriority)e.Priority,
        RecipientAddress = e.RecipientAddress,
        RecipientUserId = e.RecipientUserId,
        Subject = e.Subject,
        Body = e.Body,
        EventType = e.EventType,
        ContextDataJson = e.ContextDataJson,
        Status = (DeliveryStatus)e.Status,
        AttemptCount = e.AttemptCount,
        NextRetryAt = e.NextRetryAt,
        ErrorMessage = e.ErrorMessage,
        CreatedAt = e.CreatedAt,
        SentAt = e.SentAt,
        DeliveredAt = e.DeliveredAt
    };

    private static NotificationOutboxItemEntity MapToEntity(NotificationOutboxItem d) => new()
    {
        Id = d.Id,
        TenantId = d.TenantId,
        Channel = (int)d.Channel,
        Priority = (int)d.Priority,
        RecipientAddress = d.RecipientAddress,
        RecipientUserId = d.RecipientUserId,
        Subject = d.Subject,
        Body = d.Body,
        EventType = d.EventType,
        ContextDataJson = d.ContextDataJson,
        Status = (int)d.Status,
        AttemptCount = d.AttemptCount,
        NextRetryAt = d.NextRetryAt,
        ErrorMessage = d.ErrorMessage,
        CreatedAt = d.CreatedAt,
        SentAt = d.SentAt,
        DeliveredAt = d.DeliveredAt
    };
}
