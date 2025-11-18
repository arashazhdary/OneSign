using Microsoft.EntityFrameworkCore;
using Onesign.Modules.MultiRegion.Domain.Entities;
using Onesign.Modules.MultiRegion.Domain.Enums;
using Onesign.Modules.MultiRegion.Domain.Repositories;
using Onesign.Modules.MultiRegion.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.MultiRegion.Infrastructure.EfCore.Repositories;

public class RegionRepository : IRegionRepository
{
    private readonly DbContext _dbContext;

    public RegionRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Region?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<RegionEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<IReadOnlyList<Region>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<RegionEntity>()
            .OrderBy(x => x.DisplayName)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<Region>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<RegionEntity>()
            .Where(x => x.IsActive)
            .OrderBy(x => x.DisplayName)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<Region>> GetByStatusAsync(RegionStatus status, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<RegionEntity>()
            .Where(x => x.Status == (int)status)
            .OrderBy(x => x.DisplayName)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task AddAsync(Region region, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(region);
        await _dbContext.Set<RegionEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Region region, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<RegionEntity>()
            .FirstOrDefaultAsync(x => x.Id == region.Id, cancellationToken);

        if (entity != null)
        {
            entity.DisplayName = region.DisplayName;
            entity.IsActive = region.IsActive;
            entity.EndpointBaseUrl = region.EndpointBaseUrl;
            entity.DbClusterRef = region.DbClusterRef;
            entity.StorageClusterRef = region.StorageClusterRef;
            entity.Status = (int)region.Status;
            entity.LastHealthCheckAt = region.LastHealthCheckAt;
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<RegionEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity != null)
        {
            _dbContext.Set<RegionEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    private static Region MapToDomain(RegionEntity e) => new()
    {
        Id = e.Id,
        DisplayName = e.DisplayName,
        IsActive = e.IsActive,
        EndpointBaseUrl = e.EndpointBaseUrl,
        DbClusterRef = e.DbClusterRef,
        StorageClusterRef = e.StorageClusterRef,
        Status = (RegionStatus)e.Status,
        CreatedAt = e.CreatedAt,
        LastHealthCheckAt = e.LastHealthCheckAt
    };

    private static RegionEntity MapToEntity(Region d) => new()
    {
        Id = d.Id,
        DisplayName = d.DisplayName,
        IsActive = d.IsActive,
        EndpointBaseUrl = d.EndpointBaseUrl,
        DbClusterRef = d.DbClusterRef,
        StorageClusterRef = d.StorageClusterRef,
        Status = (int)d.Status,
        CreatedAt = d.CreatedAt,
        LastHealthCheckAt = d.LastHealthCheckAt
    };
}
