using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Deployment.Domain.Entities;
using Onesign.Modules.Deployment.Domain.Repositories;
using Onesign.Modules.Deployment.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Deployment.Infrastructure.EfCore.Repositories;

public class EnvironmentFeatureConfigRepository : IEnvironmentFeatureConfigRepository
{
    private readonly DbContext _dbContext;

    public EnvironmentFeatureConfigRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<EnvironmentFeatureConfig?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<EnvironmentFeatureConfigEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<EnvironmentFeatureConfig?> GetByEnvironmentIdAsync(string environmentId, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<EnvironmentFeatureConfigEntity>()
            .FirstOrDefaultAsync(x => x.EnvironmentId == environmentId, cancellationToken);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task AddAsync(EnvironmentFeatureConfig config, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(config);
        await _dbContext.Set<EnvironmentFeatureConfigEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(EnvironmentFeatureConfig config, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<EnvironmentFeatureConfigEntity>()
            .FirstOrDefaultAsync(x => x.Id == config.Id, cancellationToken);

        if (entity != null)
        {
            entity.MaxTenants = config.MaxTenants;
            entity.MaxUsers = config.MaxUsers;
            entity.MaxApplications = config.MaxApplications;
            entity.EnabledModulesJson = config.EnabledModulesJson;
            entity.UpdatedAt = config.UpdatedAt;
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<EnvironmentFeatureConfigEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity != null)
        {
            _dbContext.Set<EnvironmentFeatureConfigEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    private static EnvironmentFeatureConfig MapToDomain(EnvironmentFeatureConfigEntity e) => new()
    {
        Id = e.Id,
        EnvironmentId = e.EnvironmentId,
        MaxTenants = e.MaxTenants,
        MaxUsers = e.MaxUsers,
        MaxApplications = e.MaxApplications,
        EnabledModulesJson = e.EnabledModulesJson,
        CreatedAt = e.CreatedAt,
        UpdatedAt = e.UpdatedAt
    };

    private static EnvironmentFeatureConfigEntity MapToEntity(EnvironmentFeatureConfig d) => new()
    {
        Id = d.Id,
        EnvironmentId = d.EnvironmentId,
        MaxTenants = d.MaxTenants,
        MaxUsers = d.MaxUsers,
        MaxApplications = d.MaxApplications,
        EnabledModulesJson = d.EnabledModulesJson,
        CreatedAt = d.CreatedAt,
        UpdatedAt = d.UpdatedAt
    };
}
