using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Federation.Domain.Entities;
using Onesign.Modules.Federation.Domain.Repositories;
using Onesign.Modules.Federation.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Federation.Infrastructure.EfCore.Repositories;

public class AttributeMappingRepository : IAttributeMappingRepository
{
    private readonly DbContext _dbContext;

    public AttributeMappingRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<AttributeMapping?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<AttributeMappingEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        return entity?.ToDomain();
    }

    public async Task<List<AttributeMapping>> GetBySamlProviderIdAsync(Guid samlProviderId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<AttributeMappingEntity>()
            .Where(x => x.SamlProviderId == samlProviderId)
            .OrderBy(x => x.InternalAttributeName)
            .ToListAsync(cancellationToken);
        return entities.Select(e => e.ToDomain()).ToList();
    }

    public async Task<List<AttributeMapping>> GetByOidcProviderIdAsync(Guid oidcProviderId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<AttributeMappingEntity>()
            .Where(x => x.OidcFederationProviderId == oidcProviderId)
            .OrderBy(x => x.InternalAttributeName)
            .ToListAsync(cancellationToken);
        return entities.Select(e => e.ToDomain()).ToList();
    }

    public async Task<AttributeMapping> AddAsync(AttributeMapping mapping, CancellationToken cancellationToken = default)
    {
        var entity = AttributeMappingEntity.FromDomain(mapping);
        await _dbContext.Set<AttributeMappingEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity.ToDomain();
    }

    public async Task UpdateAsync(AttributeMapping mapping, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<AttributeMappingEntity>()
            .FirstOrDefaultAsync(x => x.Id == mapping.Id, cancellationToken);
        if (entity != null)
        {
            entity.InternalAttributeName = mapping.InternalAttributeName;
            entity.MappingType = mapping.MappingType;
            entity.ExternalAttributeName = mapping.ExternalAttributeName;
            entity.StaticValue = mapping.StaticValue;
            entity.TemplateExpression = mapping.TemplateExpression;
            entity.IsRequired = mapping.IsRequired;
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<AttributeMappingEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity != null)
        {
            _dbContext.Set<AttributeMappingEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}
