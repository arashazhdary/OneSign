using Microsoft.EntityFrameworkCore;
using Onesign.Api.Data;
using Onesign.Modules.PrivilegedAccess.Domain.Entities;
using Onesign.Modules.PrivilegedAccess.Domain.Enums;
using Onesign.Modules.PrivilegedAccess.Domain.Repositories;
using Onesign.Modules.PrivilegedAccess.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.PrivilegedAccess.Infrastructure.EfCore.Repositories;

public class JitGrantRepository : IJitGrantRepository
{
    private readonly OnesignDbContext _dbContext;

    public JitGrantRepository(OnesignDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<JitGrant?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<JitGrantEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<IReadOnlyList<JitGrant>> GetByUserAsync(Guid tenantId, Guid userId, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<JitGrantEntity>()
            .Where(x => x.TenantId == tenantId && x.UserId == userId)
            .OrderByDescending(x => x.GrantedAt)
            .ToListAsync(ct);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<JitGrant>> GetActiveByUserAsync(Guid tenantId, Guid userId, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<JitGrantEntity>()
            .Where(x => x.TenantId == tenantId && x.UserId == userId && x.Status == (int)JitGrantStatus.Active)
            .OrderByDescending(x => x.GrantedAt)
            .ToListAsync(ct);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<JitGrant>> GetExpiredGrantsAsync(DateTime beforeDate, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<JitGrantEntity>()
            .Where(x => x.Status == (int)JitGrantStatus.Active && x.ExpiresAt < beforeDate)
            .OrderBy(x => x.ExpiresAt)
            .ToListAsync(ct);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task AddAsync(JitGrant grant, CancellationToken ct = default)
    {
        var entity = MapToEntity(grant);
        await _dbContext.Set<JitGrantEntity>().AddAsync(entity, ct);
        await _dbContext.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(JitGrant grant, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<JitGrantEntity>()
            .FirstOrDefaultAsync(x => x.Id == grant.Id, ct);

        if (entity != null)
        {
            entity.RoleName = grant.RoleName;
            entity.ExpiresAt = grant.ExpiresAt;
            entity.Status = (int)grant.Status;
            entity.Justification = grant.Justification;

            await _dbContext.SaveChangesAsync(ct);
        }
    }

    private static JitGrant MapToDomain(JitGrantEntity e) => new()
    {
        Id = e.Id,
        TenantId = e.TenantId,
        UserId = e.UserId,
        RoleId = e.RoleId,
        RoleName = e.RoleName,
        GrantedAt = e.GrantedAt,
        ExpiresAt = e.ExpiresAt,
        ApprovedBy = e.ApprovedBy,
        AccessRequestId = e.AccessRequestId,
        Status = (JitGrantStatus)e.Status,
        Justification = e.Justification
    };

    private static JitGrantEntity MapToEntity(JitGrant d) => new()
    {
        Id = d.Id,
        TenantId = d.TenantId,
        UserId = d.UserId,
        RoleId = d.RoleId,
        RoleName = d.RoleName,
        GrantedAt = d.GrantedAt,
        ExpiresAt = d.ExpiresAt,
        ApprovedBy = d.ApprovedBy,
        AccessRequestId = d.AccessRequestId,
        Status = (int)d.Status,
        Justification = d.Justification
    };
}
