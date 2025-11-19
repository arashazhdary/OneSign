using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Privacy.Domain.Entities;
using Onesign.Modules.Privacy.Domain.Enums;
using Onesign.Modules.Privacy.Domain.Repositories;
using Onesign.Modules.Privacy.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Privacy.Infrastructure.EfCore.Repositories;

public class DataRetentionPolicyRepository : IDataRetentionPolicyRepository
{
    private readonly DbContext _dbContext;

    public DataRetentionPolicyRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<DataRetentionPolicy?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<DataRetentionPolicyEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<IEnumerable<DataRetentionPolicy>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<DataRetentionPolicyEntity>()
            .Where(x => x.TenantId == tenantId)
            .OrderBy(x => x.DataCategory)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<DataRetentionPolicy?> GetByTenantAndCategoryAsync(Guid tenantId, DataCategory category, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<DataRetentionPolicyEntity>()
            .FirstOrDefaultAsync(x => x.TenantId == tenantId && x.DataCategory == (int)category, cancellationToken);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<IEnumerable<DataRetentionPolicy>> GetEnabledAsync(CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<DataRetentionPolicyEntity>()
            .Where(x => x.Enabled)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<DataRetentionPolicy?> GetByCategoryAsync(Guid tenantId, DataCategory category, CancellationToken cancellationToken = default)
    {
        return await GetByTenantAndCategoryAsync(tenantId, category, cancellationToken);
    }

    public async Task<IEnumerable<DataRetentionPolicy>> GetEnabledPoliciesAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<DataRetentionPolicyEntity>()
            .Where(x => x.TenantId == tenantId && x.Enabled)
            .OrderBy(x => x.DataCategory)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task AddAsync(DataRetentionPolicy policy, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(policy);
        await _dbContext.Set<DataRetentionPolicyEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(DataRetentionPolicy policy, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<DataRetentionPolicyEntity>()
            .FirstOrDefaultAsync(x => x.Id == policy.Id, cancellationToken);

        if (entity != null)
        {
            entity.RetentionPeriodDays = policy.RetentionPeriodDays;
            entity.HardDeleteAfter = policy.HardDeleteAfter;
            entity.Enabled = policy.Enabled;
            entity.UpdatedAt = policy.UpdatedAt;
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<DataRetentionPolicyEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity != null)
        {
            _dbContext.Set<DataRetentionPolicyEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    private static DataRetentionPolicy MapToDomain(DataRetentionPolicyEntity e) => new()
    {
        Id = e.Id,
        TenantId = e.TenantId,
        DataCategory = (DataCategory)e.DataCategory,
        RetentionPeriodDays = e.RetentionPeriodDays,
        HardDeleteAfter = e.HardDeleteAfter,
        Enabled = e.Enabled,
        CreatedAt = e.CreatedAt,
        UpdatedAt = e.UpdatedAt
    };

    private static DataRetentionPolicyEntity MapToEntity(DataRetentionPolicy d) => new()
    {
        Id = d.Id,
        TenantId = d.TenantId,
        DataCategory = (int)d.DataCategory,
        RetentionPeriodDays = d.RetentionPeriodDays,
        HardDeleteAfter = d.HardDeleteAfter,
        Enabled = d.Enabled,
        CreatedAt = d.CreatedAt,
        UpdatedAt = d.UpdatedAt
    };
}
