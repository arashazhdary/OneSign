using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Applications.Domain.Entities;
using Onesign.Modules.Applications.Domain.Repositories;
using Onesign.Modules.Applications.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Applications.Infrastructure.EfCore.Repositories;

public class ApplicationClientRepository : IApplicationClientRepository
{
    private readonly DbContext _dbContext;

    public ApplicationClientRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<ApplicationClient?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<ApplicationClientEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        return entity == null ? null : MapToDomain(entity);
    }

    public async Task<ApplicationClient?> GetByClientIdAsync(string clientId, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<ApplicationClientEntity>()
            .FirstOrDefaultAsync(x => x.ClientId == clientId, cancellationToken);
        return entity == null ? null : MapToDomain(entity);
    }

    public async Task<List<ApplicationClient>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<ApplicationClientEntity>()
            .Where(x => x.TenantId == tenantId)
            .ToListAsync(cancellationToken);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<ApplicationClient> AddAsync(ApplicationClient client, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(client);
        await _dbContext.Set<ApplicationClientEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return MapToDomain(entity);
    }

    public async Task UpdateAsync(ApplicationClient client, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<ApplicationClientEntity>()
            .FirstOrDefaultAsync(x => x.Id == client.Id, cancellationToken);
        if (entity != null)
        {
            entity.Name = client.Name;
            entity.ApplicationType = client.ApplicationType;
            entity.GrantType = client.GrantType;
            entity.UpdatedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<ApplicationClientEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity != null)
        {
            _dbContext.Set<ApplicationClientEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    private static ApplicationClient MapToDomain(ApplicationClientEntity entity) => new()
    {
        Id = entity.Id,
        TenantId = entity.TenantId,
        ClientId = entity.ClientId,
        Name = entity.Name,
        ApplicationType = entity.ApplicationType,
        GrantType = entity.GrantType,
        CreatedAt = entity.CreatedAt,
        UpdatedAt = entity.UpdatedAt
    };

    private static ApplicationClientEntity MapToEntity(ApplicationClient client) => new()
    {
        Id = client.Id,
        TenantId = client.TenantId,
        ClientId = client.ClientId,
        Name = client.Name,
        ApplicationType = client.ApplicationType,
        GrantType = client.GrantType,
        CreatedAt = client.CreatedAt,
        UpdatedAt = client.UpdatedAt
    };
}

