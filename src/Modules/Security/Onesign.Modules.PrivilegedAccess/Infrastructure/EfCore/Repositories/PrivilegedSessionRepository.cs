using Microsoft.EntityFrameworkCore;
using Onesign.Api.Data;
using Onesign.Modules.PrivilegedAccess.Domain.Entities;
using Onesign.Modules.PrivilegedAccess.Domain.Repositories;
using Onesign.Modules.PrivilegedAccess.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.PrivilegedAccess.Infrastructure.EfCore.Repositories;

public class PrivilegedSessionRepository : IPrivilegedSessionRepository
{
    private readonly OnesignDbContext _dbContext;

    public PrivilegedSessionRepository(OnesignDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<PrivilegedSession?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<PrivilegedSessionEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<IReadOnlyList<PrivilegedSession>> GetByUserAsync(Guid tenantId, Guid userId, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<PrivilegedSessionEntity>()
            .Where(x => x.TenantId == tenantId && x.UserId == userId)
            .OrderByDescending(x => x.StartedAt)
            .ToListAsync(ct);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<PrivilegedSession>> GetActiveSessionsAsync(Guid tenantId, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<PrivilegedSessionEntity>()
            .Where(x => x.TenantId == tenantId && x.IsActive)
            .OrderByDescending(x => x.StartedAt)
            .ToListAsync(ct);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<PrivilegedSession?> GetActiveSessionByUserAsync(Guid tenantId, Guid userId, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<PrivilegedSessionEntity>()
            .FirstOrDefaultAsync(x => x.TenantId == tenantId && x.UserId == userId && x.IsActive, ct);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task AddAsync(PrivilegedSession session, CancellationToken ct = default)
    {
        var entity = MapToEntity(session);
        await _dbContext.Set<PrivilegedSessionEntity>().AddAsync(entity, ct);
        await _dbContext.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(PrivilegedSession session, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<PrivilegedSessionEntity>()
            .FirstOrDefaultAsync(x => x.Id == session.Id, ct);

        if (entity != null)
        {
            entity.UserDisplayName = session.UserDisplayName;
            entity.PrivilegedRolesJson = session.PrivilegedRolesJson;
            entity.LastActivityAt = session.LastActivityAt;
            entity.EndedAt = session.EndedAt;
            entity.IpAddress = session.IpAddress;
            entity.IsActive = session.IsActive;

            await _dbContext.SaveChangesAsync(ct);
        }
    }

    private static PrivilegedSession MapToDomain(PrivilegedSessionEntity e) => new()
    {
        Id = e.Id,
        TenantId = e.TenantId,
        UserId = e.UserId,
        UserDisplayName = e.UserDisplayName,
        PrivilegedRolesJson = e.PrivilegedRolesJson,
        StartedAt = e.StartedAt,
        LastActivityAt = e.LastActivityAt,
        EndedAt = e.EndedAt,
        IpAddress = e.IpAddress,
        IsActive = e.IsActive
    };

    private static PrivilegedSessionEntity MapToEntity(PrivilegedSession d) => new()
    {
        Id = d.Id,
        TenantId = d.TenantId,
        UserId = d.UserId,
        UserDisplayName = d.UserDisplayName,
        PrivilegedRolesJson = d.PrivilegedRolesJson,
        StartedAt = d.StartedAt,
        LastActivityAt = d.LastActivityAt,
        EndedAt = d.EndedAt,
        IpAddress = d.IpAddress,
        IsActive = d.IsActive
    };
}
