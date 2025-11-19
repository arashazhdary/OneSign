using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Federation.Domain.Entities;
using Onesign.Modules.Federation.Domain.Repositories;
using Onesign.Modules.Federation.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Federation.Infrastructure.EfCore.Repositories;

public class SamlProviderRepository : ISamlProviderRepository
{
    private readonly DbContext _dbContext;

    public SamlProviderRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<SamlProvider?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<SamlProviderEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        return entity?.ToDomain();
    }

    public async Task<List<SamlProvider>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<SamlProviderEntity>()
            .Where(x => x.TenantId == tenantId)
            .OrderBy(x => x.Name)
            .ToListAsync(cancellationToken);
        return entities.Select(e => e.ToDomain()).ToList();
    }

    public async Task<SamlProvider?> GetByEntityIdAsync(Guid tenantId, string entityId, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<SamlProviderEntity>()
            .FirstOrDefaultAsync(x => x.TenantId == tenantId && x.EntityId == entityId, cancellationToken);
        return entity?.ToDomain();
    }

    public async Task<SamlProvider> AddAsync(SamlProvider provider, CancellationToken cancellationToken = default)
    {
        var entity = SamlProviderEntity.FromDomain(provider);
        await _dbContext.Set<SamlProviderEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity.ToDomain();
    }

    public async Task UpdateAsync(SamlProvider provider, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<SamlProviderEntity>()
            .FirstOrDefaultAsync(x => x.Id == provider.Id, cancellationToken);
        if (entity != null)
        {
            entity.Name = provider.Name;
            entity.IdpSsoUrl = provider.IdpSsoUrl;
            entity.IdpCertificate = provider.IdpCertificate;
            entity.BindingType = provider.BindingType;
            entity.SignAuthRequest = provider.SignAuthRequest;
            entity.WantAssertionsSigned = provider.WantAssertionsSigned;
            entity.Enabled = provider.Enabled;
            entity.UpdatedAt = provider.UpdatedAt ?? DateTime.UtcNow;
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<SamlProviderEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity != null)
        {
            _dbContext.Set<SamlProviderEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}
