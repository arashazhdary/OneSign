using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Organization.Domain.Entities;
using Onesign.Modules.Organization.Domain.Repositories;
using Onesign.Modules.Organization.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Organization.Infrastructure.EfCore.Repositories;

public class UserOrgUnitRepository : IUserOrgUnitRepository
{
    private readonly DbContext _dbContext;

    public UserOrgUnitRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<UserOrgUnit>> GetByTenantUserIdAsync(Guid tenantUserId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<UserOrgUnitEntity>()
            .Where(x => x.TenantUserId == tenantUserId)
            .ToListAsync(cancellationToken);
        return entities.Select(e => e.ToDomain()).ToList();
    }

    public async Task<UserOrgUnit?> GetPrimaryByTenantUserIdAsync(Guid tenantUserId, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<UserOrgUnitEntity>()
            .FirstOrDefaultAsync(x => x.TenantUserId == tenantUserId && x.IsPrimary, cancellationToken);
        return entity?.ToDomain();
    }

    public async Task<List<UserOrgUnit>> GetByOrgUnitIdAsync(Guid orgUnitId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<UserOrgUnitEntity>()
            .Where(x => x.OrgUnitId == orgUnitId)
            .ToListAsync(cancellationToken);
        return entities.Select(e => e.ToDomain()).ToList();
    }

    public async Task<List<UserOrgUnit>> GetByOrgUnitAndDescendantsAsync(Guid orgUnitId, List<Guid> descendantIds, CancellationToken cancellationToken = default)
    {
        var allOrgUnitIds = new List<Guid> { orgUnitId };
        allOrgUnitIds.AddRange(descendantIds);

        var entities = await _dbContext.Set<UserOrgUnitEntity>()
            .Where(x => allOrgUnitIds.Contains(x.OrgUnitId))
            .ToListAsync(cancellationToken);
        return entities.Select(e => e.ToDomain()).ToList();
    }

    public async Task AddAsync(UserOrgUnit userOrgUnit, CancellationToken cancellationToken = default)
    {
        var entity = UserOrgUnitEntity.FromDomain(userOrgUnit);
        await _dbContext.Set<UserOrgUnitEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task AddRangeAsync(List<UserOrgUnit> userOrgUnits, CancellationToken cancellationToken = default)
    {
        var entities = userOrgUnits.Select(UserOrgUnitEntity.FromDomain).ToList();
        await _dbContext.Set<UserOrgUnitEntity>().AddRangeAsync(entities, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteByTenantUserIdAsync(Guid tenantUserId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<UserOrgUnitEntity>()
            .Where(x => x.TenantUserId == tenantUserId)
            .ToListAsync(cancellationToken);
        _dbContext.Set<UserOrgUnitEntity>().RemoveRange(entities);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid tenantUserId, Guid orgUnitId, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<UserOrgUnitEntity>()
            .FirstOrDefaultAsync(x => x.TenantUserId == tenantUserId && x.OrgUnitId == orgUnitId, cancellationToken);
        if (entity != null)
        {
            _dbContext.Set<UserOrgUnitEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}

