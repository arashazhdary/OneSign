using Microsoft.EntityFrameworkCore;
using Onesign.Modules.MultiRegion.Domain.Entities;
using Onesign.Modules.MultiRegion.Domain.Repositories;
using Onesign.Modules.MultiRegion.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.MultiRegion.Infrastructure.EfCore.Repositories;

public class TenantDataResidencyRepository : ITenantDataResidencyRepository
{
    private readonly DbContext _dbContext;

    public TenantDataResidencyRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<TenantDataResidency?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<TenantDataResidencyEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<TenantDataResidency?> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<TenantDataResidencyEntity>()
            .FirstOrDefaultAsync(x => x.TenantId == tenantId, cancellationToken);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<IReadOnlyList<TenantDataResidency>> GetByRegionIdAsync(string regionId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<TenantDataResidencyEntity>()
            .Where(x => x.DataRegionId == regionId)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<TenantDataResidency>> GetByComplianceTagAsync(string complianceTag, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<TenantDataResidencyEntity>()
            .Where(x => x.ComplianceTag == complianceTag)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task AddAsync(TenantDataResidency residency, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(residency);
        await _dbContext.Set<TenantDataResidencyEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(TenantDataResidency residency, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<TenantDataResidencyEntity>()
            .FirstOrDefaultAsync(x => x.Id == residency.Id, cancellationToken);

        if (entity != null)
        {
            entity.DataRegionId = residency.DataRegionId;
            entity.BackupRegionId = residency.BackupRegionId;
            entity.CrossRegionReplicationAllowed = residency.CrossRegionReplicationAllowed;
            entity.ComplianceTag = residency.ComplianceTag;
            entity.UpdatedAt = residency.UpdatedAt;
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<TenantDataResidencyEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity != null)
        {
            _dbContext.Set<TenantDataResidencyEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    private static TenantDataResidency MapToDomain(TenantDataResidencyEntity e) => new()
    {
        Id = e.Id,
        TenantId = e.TenantId,
        DataRegionId = e.DataRegionId,
        BackupRegionId = e.BackupRegionId,
        CrossRegionReplicationAllowed = e.CrossRegionReplicationAllowed,
        ComplianceTag = e.ComplianceTag,
        CreatedAt = e.CreatedAt,
        UpdatedAt = e.UpdatedAt
    };

    private static TenantDataResidencyEntity MapToEntity(TenantDataResidency d) => new()
    {
        Id = d.Id,
        TenantId = d.TenantId,
        DataRegionId = d.DataRegionId,
        BackupRegionId = d.BackupRegionId,
        CrossRegionReplicationAllowed = d.CrossRegionReplicationAllowed,
        ComplianceTag = d.ComplianceTag,
        CreatedAt = d.CreatedAt,
        UpdatedAt = d.UpdatedAt
    };
}
