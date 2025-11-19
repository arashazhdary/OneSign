using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Deployment.Domain.Entities;
using Onesign.Modules.Deployment.Domain.Enums;
using Onesign.Modules.Deployment.Domain.Repositories;
using Onesign.Modules.Deployment.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Deployment.Infrastructure.EfCore.Repositories;

public class DeploymentEnvironmentRepository : IDeploymentEnvironmentRepository
{
    private readonly DbContext _dbContext;

    public DeploymentEnvironmentRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<DeploymentEnvironment?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<DeploymentEnvironmentEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<IReadOnlyList<DeploymentEnvironment>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<DeploymentEnvironmentEntity>()
            .OrderBy(x => x.Name)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<DeploymentEnvironment>> GetByTypeAsync(EnvironmentType type, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<DeploymentEnvironmentEntity>()
            .Where(x => x.Type == (int)type)
            .OrderBy(x => x.Name)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<DeploymentEnvironment>> GetByRegionIdAsync(string regionId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<DeploymentEnvironmentEntity>()
            .Where(x => x.RegionId == regionId)
            .OrderBy(x => x.Name)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task AddAsync(DeploymentEnvironment environment, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(environment);
        await _dbContext.Set<DeploymentEnvironmentEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(DeploymentEnvironment environment, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<DeploymentEnvironmentEntity>()
            .FirstOrDefaultAsync(x => x.Id == environment.Id, cancellationToken);

        if (entity != null)
        {
            entity.Name = environment.Name;
            entity.Type = (int)environment.Type;
            entity.RegionId = environment.RegionId;
            entity.BaseUrl = environment.BaseUrl;
            entity.AppVersion = environment.AppVersion;
            entity.DbSchemaVersion = environment.DbSchemaVersion;
            entity.LicenseKey = environment.LicenseKey;
            entity.LastHeartbeatAt = environment.LastHeartbeatAt;
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<DeploymentEnvironmentEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity != null)
        {
            _dbContext.Set<DeploymentEnvironmentEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    private static DeploymentEnvironment MapToDomain(DeploymentEnvironmentEntity e) => new()
    {
        Id = e.Id,
        Name = e.Name,
        Type = (EnvironmentType)e.Type,
        RegionId = e.RegionId,
        BaseUrl = e.BaseUrl,
        AppVersion = e.AppVersion,
        DbSchemaVersion = e.DbSchemaVersion,
        LicenseKey = e.LicenseKey,
        CreatedAt = e.CreatedAt,
        LastHeartbeatAt = e.LastHeartbeatAt
    };

    private static DeploymentEnvironmentEntity MapToEntity(DeploymentEnvironment d) => new()
    {
        Id = d.Id,
        Name = d.Name,
        Type = (int)d.Type,
        RegionId = d.RegionId,
        BaseUrl = d.BaseUrl,
        AppVersion = d.AppVersion,
        DbSchemaVersion = d.DbSchemaVersion,
        LicenseKey = d.LicenseKey,
        CreatedAt = d.CreatedAt,
        LastHeartbeatAt = d.LastHeartbeatAt
    };
}
