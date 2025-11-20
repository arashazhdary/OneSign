using Microsoft.EntityFrameworkCore;
using Onesign.Modules.NotificationCenter.Domain.Entities;
using Onesign.Modules.NotificationCenter.Domain.Enums;
using Onesign.Modules.NotificationCenter.Domain.Repositories;
using Onesign.Modules.NotificationCenter.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.NotificationCenter.Infrastructure.EfCore.Repositories;

public class NotificationDeliveryLogRepository : INotificationDeliveryLogRepository
{
    private readonly DbContext _context;
    private readonly DbSet<NotificationDeliveryLogEntity> _dbSet;

    public NotificationDeliveryLogRepository(DbContext context)
    {
        _context = context;
        _dbSet = context.Set<NotificationDeliveryLogEntity>();
    }

    public async Task<NotificationDeliveryLog?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbSet.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        return entity == null ? null : MapToDomain(entity);
    }

    public async Task<IReadOnlyList<NotificationDeliveryLog>> GetByOutboxItemIdAsync(Guid outboxItemId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbSet
            .Where(x => x.OutboxItemId == outboxItemId)
            .OrderByDescending(x => x.Timestamp)
            .ToListAsync(cancellationToken);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<NotificationDeliveryLog>> GetByTenantIdAsync(Guid tenantId, int skip, int take, CancellationToken cancellationToken = default)
    {
        var entities = await _dbSet
            .Where(x => x.TenantId == tenantId)
            .OrderByDescending(x => x.Timestamp)
            .Skip(skip)
            .Take(take)
            .ToListAsync(cancellationToken);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<NotificationDeliveryLog>> GetFilteredAsync(
        Guid tenantId,
        NotificationChannel? channel,
        DeliveryStatus? status,
        DateTime? fromDate,
        DateTime? toDate,
        int skip,
        int take,
        CancellationToken cancellationToken = default)
    {
        var query = _dbSet.Where(x => x.TenantId == tenantId);

        if (channel.HasValue)
            query = query.Where(x => x.Channel == (int)channel.Value);
        if (status.HasValue)
            query = query.Where(x => x.Status == (int)status.Value);
        if (fromDate.HasValue)
            query = query.Where(x => x.Timestamp >= fromDate.Value);
        if (toDate.HasValue)
            query = query.Where(x => x.Timestamp <= toDate.Value);

        var entities = await query
            .OrderByDescending(x => x.Timestamp)
            .Skip(skip)
            .Take(take)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<int> GetCountAsync(
        Guid tenantId,
        NotificationChannel? channel,
        DeliveryStatus? status,
        DateTime? fromDate,
        DateTime? toDate,
        CancellationToken cancellationToken = default)
    {
        var query = _dbSet.Where(x => x.TenantId == tenantId);

        if (channel.HasValue)
            query = query.Where(x => x.Channel == (int)channel.Value);
        if (status.HasValue)
            query = query.Where(x => x.Status == (int)status.Value);
        if (fromDate.HasValue)
            query = query.Where(x => x.Timestamp >= fromDate.Value);
        if (toDate.HasValue)
            query = query.Where(x => x.Timestamp <= toDate.Value);

        return await query.CountAsync(cancellationToken);
    }

    public async Task AddAsync(NotificationDeliveryLog log, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(log);
        await _dbSet.AddAsync(entity, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    private static NotificationDeliveryLog MapToDomain(NotificationDeliveryLogEntity entity) => new()
    {
        Id = entity.Id,
        TenantId = entity.TenantId,
        OutboxItemId = entity.OutboxItemId,
        Channel = (NotificationChannel)entity.Channel,
        Status = (DeliveryStatus)entity.Status,
        ProviderMessageId = entity.ProviderMessageId,
        ErrorDetails = entity.ErrorDetails,
        Timestamp = entity.Timestamp
    };

    private static NotificationDeliveryLogEntity MapToEntity(NotificationDeliveryLog domain) => new()
    {
        Id = domain.Id,
        TenantId = domain.TenantId,
        OutboxItemId = domain.OutboxItemId,
        Channel = (int)domain.Channel,
        Status = (int)domain.Status,
        ProviderMessageId = domain.ProviderMessageId,
        ErrorDetails = domain.ErrorDetails,
        Timestamp = domain.Timestamp
    };
}
