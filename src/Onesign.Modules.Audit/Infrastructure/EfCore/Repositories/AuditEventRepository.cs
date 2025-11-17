using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Audit.Domain.Entities;
using Onesign.Modules.Audit.Domain.Repositories;
using Onesign.Modules.Audit.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Audit.Infrastructure.EfCore.Repositories;

public class AuditEventRepository : IAuditEventRepository
{
    private readonly DbContext _dbContext;

    public AuditEventRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<AuditEvent> AddAsync(AuditEvent auditEvent, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(auditEvent);
        await _dbContext.Set<AuditEventEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return MapToDomain(entity);
    }

    public async Task<List<AuditEvent>> GetByTenantIdAsync(Guid tenantId, DateTime? fromDate = null, DateTime? toDate = null, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Set<AuditEventEntity>()
            .Where(x => x.TenantId == tenantId);

        if (fromDate.HasValue)
        {
            query = query.Where(x => x.CreatedAt >= fromDate.Value);
        }

        if (toDate.HasValue)
        {
            query = query.Where(x => x.CreatedAt <= toDate.Value);
        }

        var entities = await query
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    private static AuditEvent MapToDomain(AuditEventEntity entity) => new()
    {
        Id = entity.Id,
        TenantId = entity.TenantId,
        ActorId = entity.ActorId,
        EventType = entity.EventType,
        Description = entity.Description,
        Metadata = entity.Metadata,
        CreatedAt = entity.CreatedAt,
        IpAddress = entity.IpAddress,
        UserAgent = entity.UserAgent
    };

    private static AuditEventEntity MapToEntity(AuditEvent auditEvent) => new()
    {
        Id = auditEvent.Id,
        TenantId = auditEvent.TenantId,
        ActorId = auditEvent.ActorId,
        EventType = auditEvent.EventType,
        Description = auditEvent.Description,
        Metadata = auditEvent.Metadata,
        CreatedAt = auditEvent.CreatedAt,
        IpAddress = auditEvent.IpAddress,
        UserAgent = auditEvent.UserAgent
    };
}

