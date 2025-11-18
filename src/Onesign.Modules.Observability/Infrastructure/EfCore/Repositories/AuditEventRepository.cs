using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Observability.Domain.Entities;
using Onesign.Modules.Observability.Domain.Enums;
using Onesign.Modules.Observability.Domain.Repositories;
using Onesign.Modules.Observability.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Observability.Infrastructure.EfCore.Repositories;

public class AuditEventRepository : IAuditEventRepository
{
    private readonly DbContext _dbContext;

    public AuditEventRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<AuditEvent?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<AuditEventEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity?.ToDomain();
    }

    public async Task<List<AuditEvent>> SearchAsync(
        Guid? tenantId,
        DateTime? from,
        DateTime? to,
        AuditCategory? category,
        AuditSeverity? severity,
        string? actorId,
        string? action,
        int skip,
        int take,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Set<AuditEventEntity>().AsQueryable();

        if (tenantId.HasValue)
        {
            query = query.Where(x => x.TenantId == tenantId.Value);
        }

        if (from.HasValue)
        {
            query = query.Where(x => x.OccurredAt >= from.Value);
        }

        if (to.HasValue)
        {
            query = query.Where(x => x.OccurredAt <= to.Value);
        }

        if (category.HasValue)
        {
            query = query.Where(x => x.Category == category.Value);
        }

        if (severity.HasValue)
        {
            query = query.Where(x => x.Severity == severity.Value);
        }

        if (!string.IsNullOrEmpty(actorId))
        {
            query = query.Where(x => x.ActorId == actorId);
        }

        if (!string.IsNullOrEmpty(action))
        {
            query = query.Where(x => x.Action.Contains(action));
        }

        var entities = await query
            .OrderByDescending(x => x.OccurredAt)
            .Skip(skip)
            .Take(take)
            .ToListAsync(cancellationToken);

        return entities.Select(e => e.ToDomain()).ToList();
    }

    public async Task<int> CountAsync(
        Guid? tenantId,
        DateTime? from,
        DateTime? to,
        AuditCategory? category,
        AuditSeverity? severity,
        string? actorId,
        string? action,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Set<AuditEventEntity>().AsQueryable();

        if (tenantId.HasValue)
        {
            query = query.Where(x => x.TenantId == tenantId.Value);
        }

        if (from.HasValue)
        {
            query = query.Where(x => x.OccurredAt >= from.Value);
        }

        if (to.HasValue)
        {
            query = query.Where(x => x.OccurredAt <= to.Value);
        }

        if (category.HasValue)
        {
            query = query.Where(x => x.Category == category.Value);
        }

        if (severity.HasValue)
        {
            query = query.Where(x => x.Severity == severity.Value);
        }

        if (!string.IsNullOrEmpty(actorId))
        {
            query = query.Where(x => x.ActorId == actorId);
        }

        if (!string.IsNullOrEmpty(action))
        {
            query = query.Where(x => x.Action.Contains(action));
        }

        return await query.CountAsync(cancellationToken);
    }

    public async Task<AuditEvent> AddAsync(AuditEvent auditEvent, CancellationToken cancellationToken = default)
    {
        var entity = AuditEventEntity.FromDomain(auditEvent);
        await _dbContext.Set<AuditEventEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity.ToDomain();
    }
}
