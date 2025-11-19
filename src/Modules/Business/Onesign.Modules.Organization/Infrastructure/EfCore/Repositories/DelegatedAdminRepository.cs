using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Organization.Domain.Entities;
using Onesign.Modules.Organization.Domain.Repositories;
using Onesign.Modules.Organization.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Organization.Infrastructure.EfCore.Repositories;

public class DelegatedAdminRepository : IDelegatedAdminRepository
{
    private readonly DbContext _dbContext;

    public DelegatedAdminRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<DelegatedAdminScope?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<DelegatedAdminScopeEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        return entity?.ToDomain();
    }

    public async Task<List<DelegatedAdminScope>> GetByTenantUserIdAsync(Guid tenantUserId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<DelegatedAdminScopeEntity>()
            .Where(x => x.TenantUserId == tenantUserId)
            .ToListAsync(cancellationToken);
        return entities.Select(e => e.ToDomain()).ToList();
    }

    public async Task<List<DelegatedAdminScope>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        // We need to join with OrgUnit to filter by TenantId
        var entities = await _dbContext.Set<DelegatedAdminScopeEntity>()
            .Join(
                _dbContext.Set<OrgUnitEntity>(),
                scope => scope.OrgUnitId,
                orgUnit => orgUnit.Id,
                (scope, orgUnit) => new { Scope = scope, OrgUnit = orgUnit }
            )
            .Where(x => x.OrgUnit.TenantId == tenantId)
            .Select(x => x.Scope)
            .ToListAsync(cancellationToken);
        return entities.Select(e => e.ToDomain()).ToList();
    }

    public async Task<DelegatedAdminScope> AddAsync(DelegatedAdminScope delegatedAdminScope, CancellationToken cancellationToken = default)
    {
        var entity = DelegatedAdminScopeEntity.FromDomain(delegatedAdminScope);
        await _dbContext.Set<DelegatedAdminScopeEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity.ToDomain();
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<DelegatedAdminScopeEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity != null)
        {
            _dbContext.Set<DelegatedAdminScopeEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task<bool> ExistsAsync(Guid tenantUserId, Guid orgUnitId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Set<DelegatedAdminScopeEntity>()
            .AnyAsync(x => x.TenantUserId == tenantUserId && x.OrgUnitId == orgUnitId, cancellationToken);
    }
}

