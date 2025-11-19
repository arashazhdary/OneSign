using Microsoft.EntityFrameworkCore;
using Onesign.Data.Contexts;
using Onesign.Modules.IdentityLifecycle.Domain.Entities;
using Onesign.Modules.IdentityLifecycle.Domain.Enums;
using Onesign.Modules.IdentityLifecycle.Domain.Repositories;
using Onesign.Modules.IdentityLifecycle.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.IdentityLifecycle.Infrastructure.EfCore.Repositories;

public class LifecycleEventRepository : ILifecycleEventRepository
{
    private readonly OnesignDbContext _dbContext;

    public LifecycleEventRepository(OnesignDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<LifecycleEvent?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<LifecycleEventEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<IReadOnlyList<LifecycleEvent>> GetByHRRecordIdAsync(Guid hrRecordId, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<LifecycleEventEntity>()
            .Where(x => x.HRRecordId == hrRecordId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(ct);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<LifecycleEvent>> GetByStatusAsync(Guid tenantId, ProcessingStatus status, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<LifecycleEventEntity>()
            .Where(x => x.TenantId == tenantId && x.Status == (int)status)
            .OrderBy(x => x.CreatedAt)
            .ToListAsync(ct);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<LifecycleEvent>> GetPendingEventsAsync(Guid tenantId, int limit = 100, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<LifecycleEventEntity>()
            .Where(x => x.TenantId == tenantId && x.Status == (int)ProcessingStatus.Pending)
            .OrderBy(x => x.CreatedAt)
            .Take(limit)
            .ToListAsync(ct);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task AddAsync(LifecycleEvent lifecycleEvent, CancellationToken ct = default)
    {
        var entity = MapToEntity(lifecycleEvent);
        await _dbContext.Set<LifecycleEventEntity>().AddAsync(entity, ct);
        await _dbContext.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(LifecycleEvent lifecycleEvent, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<LifecycleEventEntity>()
            .FirstOrDefaultAsync(x => x.Id == lifecycleEvent.Id, ct);

        if (entity != null)
        {
            entity.EventType = (int)lifecycleEvent.EventType;
            entity.OldSnapshotJson = lifecycleEvent.OldSnapshotJson;
            entity.NewSnapshotJson = lifecycleEvent.NewSnapshotJson;
            entity.Status = (int)lifecycleEvent.Status;
            entity.ErrorMessage = lifecycleEvent.ErrorMessage;
            entity.ProcessedAt = lifecycleEvent.ProcessedAt;

            await _dbContext.SaveChangesAsync(ct);
        }
    }

    private static LifecycleEvent MapToDomain(LifecycleEventEntity e) => new()
    {
        Id = e.Id,
        TenantId = e.TenantId,
        HRRecordId = e.HRRecordId,
        EventType = (LifecycleEventType)e.EventType,
        OldSnapshotJson = e.OldSnapshotJson,
        NewSnapshotJson = e.NewSnapshotJson,
        Status = (ProcessingStatus)e.Status,
        ErrorMessage = e.ErrorMessage,
        CreatedAt = e.CreatedAt,
        ProcessedAt = e.ProcessedAt
    };

    private static LifecycleEventEntity MapToEntity(LifecycleEvent d) => new()
    {
        Id = d.Id,
        TenantId = d.TenantId,
        HRRecordId = d.HRRecordId,
        EventType = (int)d.EventType,
        OldSnapshotJson = d.OldSnapshotJson,
        NewSnapshotJson = d.NewSnapshotJson,
        Status = (int)d.Status,
        ErrorMessage = d.ErrorMessage,
        CreatedAt = d.CreatedAt,
        ProcessedAt = d.ProcessedAt
    };
}
