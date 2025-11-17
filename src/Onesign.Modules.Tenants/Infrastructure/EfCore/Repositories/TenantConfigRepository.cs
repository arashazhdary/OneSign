using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Tenants.Domain.Entities;
using Onesign.Modules.Tenants.Domain.Repositories;
using Onesign.Modules.Tenants.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Tenants.Infrastructure.EfCore.Repositories;

public class TenantConfigRepository : ITenantConfigRepository
{
    private readonly DbContext _dbContext;

    public TenantConfigRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<TenantConfig?> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<TenantConfigEntity>()
            .FirstOrDefaultAsync(x => x.TenantId == tenantId, cancellationToken);
        return entity == null ? null : MapToDomain(entity);
    }

    public async Task<TenantConfig> AddAsync(TenantConfig config, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(config);
        await _dbContext.Set<TenantConfigEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return MapToDomain(entity);
    }

    public async Task UpdateAsync(TenantConfig config, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<TenantConfigEntity>()
            .FirstOrDefaultAsync(x => x.Id == config.Id, cancellationToken);
        if (entity != null)
        {
            entity.LogoUrl = config.LogoUrl;
            entity.PrimaryColor = config.PrimaryColor;
            entity.UpdatedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    private static TenantConfig MapToDomain(TenantConfigEntity entity) => new()
    {
        Id = entity.Id,
        TenantId = entity.TenantId,
        LogoUrl = entity.LogoUrl,
        PrimaryColor = entity.PrimaryColor,
        CreatedAt = entity.CreatedAt,
        UpdatedAt = entity.UpdatedAt
    };

    private static TenantConfigEntity MapToEntity(TenantConfig config) => new()
    {
        Id = config.Id,
        TenantId = config.TenantId,
        LogoUrl = config.LogoUrl,
        PrimaryColor = config.PrimaryColor,
        CreatedAt = config.CreatedAt,
        UpdatedAt = config.UpdatedAt
    };
}

