using Microsoft.EntityFrameworkCore;
using Onesign.Api.Data;
using Onesign.Modules.IdentityLifecycle.Domain.Entities;
using Onesign.Modules.IdentityLifecycle.Domain.Repositories;
using Onesign.Modules.IdentityLifecycle.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.IdentityLifecycle.Infrastructure.EfCore.Repositories;

public class LifecyclePolicyRepository : ILifecyclePolicyRepository
{
    private readonly OnesignDbContext _dbContext;

    public LifecyclePolicyRepository(OnesignDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<LifecyclePolicy?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<LifecyclePolicyEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<IReadOnlyList<LifecyclePolicy>> GetByTenantAsync(Guid tenantId, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<LifecyclePolicyEntity>()
            .Where(x => x.TenantId == tenantId)
            .OrderBy(x => x.Name)
            .ToListAsync(ct);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<LifecyclePolicy>> GetMatchingPoliciesAsync(Guid tenantId, string? orgUnitCode, string? jobRole, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<LifecyclePolicyEntity>()
            .Where(x => x.TenantId == tenantId && x.IsEnabled)
            .Where(x =>
                (x.OrgUnitCode == null || x.OrgUnitCode == orgUnitCode) &&
                (x.JobRole == null || x.JobRole == jobRole))
            .OrderBy(x => x.Name)
            .ToListAsync(ct);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task AddAsync(LifecyclePolicy policy, CancellationToken ct = default)
    {
        var entity = MapToEntity(policy);
        await _dbContext.Set<LifecyclePolicyEntity>().AddAsync(entity, ct);
        await _dbContext.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(LifecyclePolicy policy, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<LifecyclePolicyEntity>()
            .FirstOrDefaultAsync(x => x.Id == policy.Id, ct);

        if (entity != null)
        {
            entity.Name = policy.Name;
            entity.OrgUnitCode = policy.OrgUnitCode;
            entity.JobRole = policy.JobRole;
            entity.Location = policy.Location;
            entity.EmploymentType = policy.EmploymentType;
            entity.AccessPackageIdsJson = policy.AccessPackageIdsJson;
            entity.IsEnabled = policy.IsEnabled;

            await _dbContext.SaveChangesAsync(ct);
        }
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<LifecyclePolicyEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        if (entity != null)
        {
            _dbContext.Set<LifecyclePolicyEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(ct);
        }
    }

    private static LifecyclePolicy MapToDomain(LifecyclePolicyEntity e) => new()
    {
        Id = e.Id,
        TenantId = e.TenantId,
        Name = e.Name,
        OrgUnitCode = e.OrgUnitCode,
        JobRole = e.JobRole,
        Location = e.Location,
        EmploymentType = e.EmploymentType,
        AccessPackageIdsJson = e.AccessPackageIdsJson,
        IsEnabled = e.IsEnabled,
        CreatedAt = e.CreatedAt
    };

    private static LifecyclePolicyEntity MapToEntity(LifecyclePolicy d) => new()
    {
        Id = d.Id,
        TenantId = d.TenantId,
        Name = d.Name,
        OrgUnitCode = d.OrgUnitCode,
        JobRole = d.JobRole,
        Location = d.Location,
        EmploymentType = d.EmploymentType,
        AccessPackageIdsJson = d.AccessPackageIdsJson,
        IsEnabled = d.IsEnabled,
        CreatedAt = d.CreatedAt
    };
}
