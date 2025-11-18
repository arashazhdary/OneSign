using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Federation.Domain.Entities;
using Onesign.Modules.Federation.Domain.Repositories;
using Onesign.Modules.Federation.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Federation.Infrastructure.EfCore.Repositories;

public class OidcFederationProviderRepository : IOidcFederationProviderRepository
{
    private readonly DbContext _dbContext;

    public OidcFederationProviderRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<OidcFederationProvider?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<OidcFederationProviderEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        return entity?.ToDomain();
    }

    public async Task<List<OidcFederationProvider>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<OidcFederationProviderEntity>()
            .Where(x => x.TenantId == tenantId)
            .OrderBy(x => x.Name)
            .ToListAsync(cancellationToken);
        return entities.Select(e => e.ToDomain()).ToList();
    }

    public async Task<OidcFederationProvider> AddAsync(OidcFederationProvider provider, CancellationToken cancellationToken = default)
    {
        var entity = OidcFederationProviderEntity.FromDomain(provider);
        await _dbContext.Set<OidcFederationProviderEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity.ToDomain();
    }

    public async Task UpdateAsync(OidcFederationProvider provider, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<OidcFederationProviderEntity>()
            .FirstOrDefaultAsync(x => x.Id == provider.Id, cancellationToken);
        if (entity != null)
        {
            entity.Name = provider.Name;
            entity.Authority = provider.Authority;
            entity.ClientId = provider.ClientId;
            entity.ClientSecret = provider.ClientSecret;
            entity.Scopes = provider.Scopes;
            entity.Enabled = provider.Enabled;
            entity.UpdatedAt = provider.UpdatedAt ?? DateTime.UtcNow;
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<OidcFederationProviderEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity != null)
        {
            _dbContext.Set<OidcFederationProviderEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}
