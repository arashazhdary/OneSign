using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Crypto.Domain.Entities;
using Onesign.Modules.Crypto.Domain.Enums;
using Onesign.Modules.Crypto.Domain.Repositories;
using Onesign.Modules.Crypto.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Crypto.Infrastructure.EfCore.Repositories;

public class KeySetRepository : IKeySetRepository
{
    private readonly DbContext _dbContext;

    public KeySetRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<KeySet?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<KeySetEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<IReadOnlyList<KeySet>> GetByScopeAsync(KeyScopeType scopeType, string scopeId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<KeySetEntity>()
            .Where(x => x.ScopeType == (int)scopeType && x.ScopeId == scopeId)
            .OrderBy(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<KeySet?> GetDefaultForScopeAsync(KeyScopeType scopeType, string scopeId, KeyPurpose purpose, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<KeySetEntity>()
            .FirstOrDefaultAsync(x => x.ScopeType == (int)scopeType && x.ScopeId == scopeId && x.Purpose == (int)purpose && x.IsDefaultForScope, cancellationToken);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<IReadOnlyList<KeySet>> GetByPurposeAsync(KeyPurpose purpose, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<KeySetEntity>()
            .Where(x => x.Purpose == (int)purpose)
            .OrderBy(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task AddAsync(KeySet keySet, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(keySet);
        await _dbContext.Set<KeySetEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(KeySet keySet, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<KeySetEntity>()
            .FirstOrDefaultAsync(x => x.Id == keySet.Id, cancellationToken);

        if (entity != null)
        {
            entity.ScopeType = (int)keySet.ScopeType;
            entity.ScopeId = keySet.ScopeId;
            entity.Purpose = (int)keySet.Purpose;
            entity.IsDefaultForScope = keySet.IsDefaultForScope;
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<KeySetEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity != null)
        {
            _dbContext.Set<KeySetEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    private static KeySet MapToDomain(KeySetEntity e) => new()
    {
        Id = e.Id,
        ScopeType = (KeyScopeType)e.ScopeType,
        ScopeId = e.ScopeId,
        Purpose = (KeyPurpose)e.Purpose,
        IsDefaultForScope = e.IsDefaultForScope,
        CreatedAt = e.CreatedAt
    };

    private static KeySetEntity MapToEntity(KeySet d) => new()
    {
        Id = d.Id,
        ScopeType = (int)d.ScopeType,
        ScopeId = d.ScopeId,
        Purpose = (int)d.Purpose,
        IsDefaultForScope = d.IsDefaultForScope,
        CreatedAt = d.CreatedAt
    };
}
