using Microsoft.EntityFrameworkCore;
using Onesign.Api.Data;
using Onesign.Modules.IdentityLifecycle.Domain.Entities;
using Onesign.Modules.IdentityLifecycle.Domain.Repositories;
using Onesign.Modules.IdentityLifecycle.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.IdentityLifecycle.Infrastructure.EfCore.Repositories;

public class AccessPackageRepository : IAccessPackageRepository
{
    private readonly OnesignDbContext _dbContext;

    public AccessPackageRepository(OnesignDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<AccessPackage?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<AccessPackageEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<IReadOnlyList<AccessPackage>> GetByTenantAsync(Guid tenantId, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<AccessPackageEntity>()
            .Where(x => x.TenantId == tenantId)
            .OrderBy(x => x.Name)
            .ToListAsync(ct);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<AccessPackage>> GetEnabledByTenantAsync(Guid tenantId, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<AccessPackageEntity>()
            .Where(x => x.TenantId == tenantId && x.IsEnabled)
            .OrderBy(x => x.Name)
            .ToListAsync(ct);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task AddAsync(AccessPackage package, CancellationToken ct = default)
    {
        var entity = MapToEntity(package);
        await _dbContext.Set<AccessPackageEntity>().AddAsync(entity, ct);
        await _dbContext.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(AccessPackage package, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<AccessPackageEntity>()
            .FirstOrDefaultAsync(x => x.Id == package.Id, ct);

        if (entity != null)
        {
            entity.Name = package.Name;
            entity.Description = package.Description;
            entity.RoleIdsJson = package.RoleIdsJson;
            entity.ApplicationIdsJson = package.ApplicationIdsJson;
            entity.IsEnabled = package.IsEnabled;

            await _dbContext.SaveChangesAsync(ct);
        }
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<AccessPackageEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        if (entity != null)
        {
            _dbContext.Set<AccessPackageEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(ct);
        }
    }

    private static AccessPackage MapToDomain(AccessPackageEntity e) => new()
    {
        Id = e.Id,
        TenantId = e.TenantId,
        Name = e.Name,
        Description = e.Description,
        RoleIdsJson = e.RoleIdsJson,
        ApplicationIdsJson = e.ApplicationIdsJson,
        IsEnabled = e.IsEnabled,
        CreatedAt = e.CreatedAt
    };

    private static AccessPackageEntity MapToEntity(AccessPackage d) => new()
    {
        Id = d.Id,
        TenantId = d.TenantId,
        Name = d.Name,
        Description = d.Description,
        RoleIdsJson = d.RoleIdsJson,
        ApplicationIdsJson = d.ApplicationIdsJson,
        IsEnabled = d.IsEnabled,
        CreatedAt = d.CreatedAt
    };
}
