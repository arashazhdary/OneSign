using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Incidents.Domain.Entities;
using Onesign.Modules.Incidents.Domain.Repositories;
using Onesign.Modules.Incidents.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Incidents.Infrastructure.EfCore.Repositories;

public class IncidentNoteRepository : IIncidentNoteRepository
{
    private readonly DbContext _dbContext;

    public IncidentNoteRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IncidentNote?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<IncidentNoteEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, ct);
        return entity == null ? null : MapToDomain(entity);
    }

    public async Task<IReadOnlyList<IncidentNote>> GetByIncidentAsync(Guid incidentId, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<IncidentNoteEntity>()
            .Where(x => x.IncidentId == incidentId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<IncidentNote>> GetByUserAsync(Guid incidentId, Guid userId, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<IncidentNoteEntity>()
            .Where(x => x.IncidentId == incidentId && x.CreatedByUserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task AddAsync(IncidentNote note, CancellationToken ct = default)
    {
        var entity = MapToEntity(note);
        await _dbContext.Set<IncidentNoteEntity>().AddAsync(entity, ct);
        await _dbContext.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(IncidentNote note, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<IncidentNoteEntity>()
            .FirstOrDefaultAsync(x => x.Id == note.Id, ct);
        if (entity != null)
        {
            entity.Content = note.Content;
            entity.UpdatedAt = note.UpdatedAt;
            await _dbContext.SaveChangesAsync(ct);
        }
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<IncidentNoteEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity != null)
        {
            _dbContext.Set<IncidentNoteEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(ct);
        }
    }

    public async Task DeleteByIncidentAsync(Guid incidentId, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<IncidentNoteEntity>()
            .Where(x => x.IncidentId == incidentId)
            .ToListAsync(ct);
        _dbContext.Set<IncidentNoteEntity>().RemoveRange(entities);
        await _dbContext.SaveChangesAsync(ct);
    }

    private static IncidentNote MapToDomain(IncidentNoteEntity entity) => new()
    {
        Id = entity.Id,
        IncidentId = entity.IncidentId,
        Content = entity.Content,
        CreatedByUserId = entity.CreatedByUserId,
        CreatedAt = entity.CreatedAt,
        UpdatedAt = entity.UpdatedAt
    };

    private static IncidentNoteEntity MapToEntity(IncidentNote note) => new()
    {
        Id = note.Id,
        IncidentId = note.IncidentId,
        Content = note.Content,
        CreatedByUserId = note.CreatedByUserId,
        CreatedAt = note.CreatedAt,
        UpdatedAt = note.UpdatedAt
    };
}
