using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Incidents.Domain.Entities;
using Onesign.Modules.Incidents.Domain.Repositories;
using Onesign.Modules.Incidents.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Incidents.Infrastructure.EfCore.Repositories;

public class IncidentEventRepository : IIncidentEventRepository
{
    private readonly DbContext _dbContext;

    public IncidentEventRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IncidentEvent?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<IncidentEventEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, ct);
        return entity == null ? null : MapToDomain(entity);
    }

    public async Task<IReadOnlyList<IncidentEvent>> GetByIncidentAsync(Guid incidentId, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<IncidentEventEntity>()
            .Where(x => x.IncidentId == incidentId)
            .OrderBy(x => x.Timestamp)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<IncidentEvent>> GetByIncidentAndTypeAsync(Guid incidentId, string eventType, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<IncidentEventEntity>()
            .Where(x => x.IncidentId == incidentId && x.EventType == eventType)
            .OrderBy(x => x.Timestamp)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<IncidentEvent>> GetBySourceModuleAsync(Guid incidentId, string sourceModule, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<IncidentEventEntity>()
            .Where(x => x.IncidentId == incidentId && x.SourceModule == sourceModule)
            .OrderBy(x => x.Timestamp)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<IncidentEvent>> GetByDateRangeAsync(Guid incidentId, DateTime from, DateTime to, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<IncidentEventEntity>()
            .Where(x => x.IncidentId == incidentId && x.Timestamp >= from && x.Timestamp <= to)
            .OrderBy(x => x.Timestamp)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task AddAsync(IncidentEvent incidentEvent, CancellationToken ct = default)
    {
        var entity = MapToEntity(incidentEvent);
        await _dbContext.Set<IncidentEventEntity>().AddAsync(entity, ct);
        await _dbContext.SaveChangesAsync(ct);
    }

    public async Task AddManyAsync(IEnumerable<IncidentEvent> events, CancellationToken ct = default)
    {
        var entities = events.Select(MapToEntity);
        await _dbContext.Set<IncidentEventEntity>().AddRangeAsync(entities, ct);
        await _dbContext.SaveChangesAsync(ct);
    }

    public async Task DeleteByIncidentAsync(Guid incidentId, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<IncidentEventEntity>()
            .Where(x => x.IncidentId == incidentId)
            .ToListAsync(ct);
        _dbContext.Set<IncidentEventEntity>().RemoveRange(entities);
        await _dbContext.SaveChangesAsync(ct);
    }

    private static IncidentEvent MapToDomain(IncidentEventEntity entity) => new()
    {
        Id = entity.Id,
        IncidentId = entity.IncidentId,
        EventType = entity.EventType,
        EventData = entity.EventData,
        Timestamp = entity.Timestamp,
        SourceModule = entity.SourceModule
    };

    private static IncidentEventEntity MapToEntity(IncidentEvent incidentEvent) => new()
    {
        Id = incidentEvent.Id,
        IncidentId = incidentEvent.IncidentId,
        EventType = incidentEvent.EventType,
        EventData = incidentEvent.EventData,
        Timestamp = incidentEvent.Timestamp,
        SourceModule = incidentEvent.SourceModule
    };
}
