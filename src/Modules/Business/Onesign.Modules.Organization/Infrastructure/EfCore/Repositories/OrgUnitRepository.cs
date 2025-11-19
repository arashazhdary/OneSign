using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Organization.Domain.Entities;
using Onesign.Modules.Organization.Domain.Repositories;
using Onesign.Modules.Organization.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Organization.Infrastructure.EfCore.Repositories;

public class OrgUnitRepository : IOrgUnitRepository
{
    private readonly DbContext _dbContext;

    public OrgUnitRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<OrgUnit?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<OrgUnitEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        return entity?.ToDomain();
    }

    public async Task<OrgUnit?> GetRootByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<OrgUnitEntity>()
            .FirstOrDefaultAsync(x => x.TenantId == tenantId && x.ParentId == null, cancellationToken);
        return entity?.ToDomain();
    }

    public async Task<List<OrgUnit>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<OrgUnitEntity>()
            .Where(x => x.TenantId == tenantId)
            .OrderBy(x => x.SortOrder)
            .ToListAsync(cancellationToken);
        return entities.Select(e => e.ToDomain()).ToList();
    }

    public async Task<List<OrgUnit>> GetChildrenAsync(Guid parentId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<OrgUnitEntity>()
            .Where(x => x.ParentId == parentId)
            .OrderBy(x => x.SortOrder)
            .ToListAsync(cancellationToken);
        return entities.Select(e => e.ToDomain()).ToList();
    }

    public async Task<List<OrgUnit>> GetDescendantsAsync(Guid orgUnitId, CancellationToken cancellationToken = default)
    {
        var orgUnit = await GetByIdAsync(orgUnitId, cancellationToken);
        if (orgUnit == null)
        {
            return new List<OrgUnit>();
        }

        var pathPrefix = orgUnit.Path + "/";
        var entities = await _dbContext.Set<OrgUnitEntity>()
            .Where(x => x.Path.StartsWith(pathPrefix) && x.Id != orgUnitId)
            .OrderBy(x => x.SortOrder)
            .ToListAsync(cancellationToken);
        return entities.Select(e => e.ToDomain()).ToList();
    }

    public async Task<OrgUnit> AddAsync(OrgUnit orgUnit, CancellationToken cancellationToken = default)
    {
        var entity = OrgUnitEntity.FromDomain(orgUnit);
        await _dbContext.Set<OrgUnitEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity.ToDomain();
    }

    public async Task UpdateAsync(OrgUnit orgUnit, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<OrgUnitEntity>()
            .FirstOrDefaultAsync(x => x.Id == orgUnit.Id, cancellationToken);
        if (entity != null)
        {
            entity.Name = orgUnit.Name;
            entity.Code = orgUnit.Code;
            entity.Path = orgUnit.Path;
            entity.Level = orgUnit.Level;
            entity.SortOrder = orgUnit.SortOrder;
            entity.Status = orgUnit.Status;
            entity.ParentId = orgUnit.ParentId;
            entity.UpdatedAt = orgUnit.UpdatedAt ?? DateTime.UtcNow;
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<OrgUnitEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity != null)
        {
            _dbContext.Set<OrgUnitEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task<bool> HasChildrenAsync(Guid orgUnitId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Set<OrgUnitEntity>()
            .AnyAsync(x => x.ParentId == orgUnitId, cancellationToken);
    }

    public async Task<int> GetMaxSortOrderForParentAsync(Guid? parentId, Guid tenantId, CancellationToken cancellationToken = default)
    {
        var maxOrder = await _dbContext.Set<OrgUnitEntity>()
            .Where(x => x.TenantId == tenantId && x.ParentId == parentId)
            .Select(x => (int?)x.SortOrder)
            .MaxAsync(cancellationToken);
        return maxOrder ?? 0;
    }
}

