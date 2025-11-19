using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Federation.Domain.Entities;
using Onesign.Modules.Federation.Domain.Repositories;
using Onesign.Modules.Federation.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Federation.Infrastructure.EfCore.Repositories;

public class ScimTokenRepository : IScimTokenRepository
{
    private readonly DbContext _dbContext;

    public ScimTokenRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<ScimToken?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<ScimTokenEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        return entity?.ToDomain();
    }

    public async Task<List<ScimToken>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<ScimTokenEntity>()
            .Where(x => x.TenantId == tenantId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);
        return entities.Select(e => e.ToDomain()).ToList();
    }

    public async Task<ScimToken?> GetByTokenHashAsync(string tokenHash, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<ScimTokenEntity>()
            .FirstOrDefaultAsync(x => x.TokenHash == tokenHash, cancellationToken);
        return entity?.ToDomain();
    }

    public async Task<ScimToken> AddAsync(ScimToken token, CancellationToken cancellationToken = default)
    {
        var entity = ScimTokenEntity.FromDomain(token);
        await _dbContext.Set<ScimTokenEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity.ToDomain();
    }

    public async Task UpdateAsync(ScimToken token, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<ScimTokenEntity>()
            .FirstOrDefaultAsync(x => x.Id == token.Id, cancellationToken);
        if (entity != null)
        {
            entity.Status = token.Status;
            entity.LastUsedAt = token.LastUsedAt;
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<ScimTokenEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity != null)
        {
            _dbContext.Set<ScimTokenEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}
