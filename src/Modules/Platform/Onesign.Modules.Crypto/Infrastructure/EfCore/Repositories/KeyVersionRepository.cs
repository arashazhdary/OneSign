using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Crypto.Domain.Entities;
using Onesign.Modules.Crypto.Domain.Enums;
using Onesign.Modules.Crypto.Domain.Repositories;
using Onesign.Modules.Crypto.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Crypto.Infrastructure.EfCore.Repositories;

public class KeyVersionRepository : IKeyVersionRepository
{
    private readonly DbContext _dbContext;

    public KeyVersionRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<KeyVersion?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<KeyVersionEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<KeyVersion?> GetByKidAsync(string kid, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<KeyVersionEntity>()
            .FirstOrDefaultAsync(x => x.Kid == kid, cancellationToken);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<IEnumerable<KeyVersion>> GetByKeySetIdAsync(Guid keySetId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<KeyVersionEntity>()
            .Where(x => x.KeySetId == keySetId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<KeyVersion?> GetActiveByKeySetIdAsync(Guid keySetId, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<KeyVersionEntity>()
            .FirstOrDefaultAsync(x => x.KeySetId == keySetId && x.State == (int)KeyVersionState.Active, cancellationToken);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<KeyVersion?> GetActiveKeyAsync(Guid keySetId, CancellationToken cancellationToken = default)
    {
        return await GetActiveByKeySetIdAsync(keySetId, cancellationToken);
    }

    public async Task<IEnumerable<KeyVersion>> GetByStateAsync(KeyVersionState state, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<KeyVersionEntity>()
            .Where(x => x.State == (int)state)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IEnumerable<KeyVersion>> GetActiveKeysAsync(CancellationToken cancellationToken = default)
    {
        return await GetByStateAsync(KeyVersionState.Active, cancellationToken);
    }

    public async Task<IEnumerable<KeyVersion>> GetExpiredKeysAsync(CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<KeyVersionEntity>()
            .Where(x => x.ExpiredAt.HasValue && x.ExpiredAt.Value < DateTime.UtcNow)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IEnumerable<KeyVersion>> GetRecentlyRetiredKeysAsync(TimeSpan gracePeriod, CancellationToken cancellationToken = default)
    {
        var cutoffDate = DateTime.UtcNow - gracePeriod;
        var entities = await _dbContext.Set<KeyVersionEntity>()
            .Where(x => x.State == (int)KeyVersionState.Retired && x.ExpiredAt.HasValue && x.ExpiredAt.Value >= cutoffDate)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task AddAsync(KeyVersion keyVersion, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(keyVersion);
        await _dbContext.Set<KeyVersionEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(KeyVersion keyVersion, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<KeyVersionEntity>()
            .FirstOrDefaultAsync(x => x.Id == keyVersion.Id, cancellationToken);

        if (entity != null)
        {
            entity.State = (int)keyVersion.State;
            entity.ExpiredAt = keyVersion.ExpiredAt;
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<KeyVersionEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity != null)
        {
            _dbContext.Set<KeyVersionEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    private static KeyVersion MapToDomain(KeyVersionEntity e) => new()
    {
        Id = e.Id,
        KeySetId = e.KeySetId,
        Kid = e.Kid,
        Algorithm = e.Algorithm,
        KeyMaterial = e.KeyMaterial,
        CreatedAt = e.CreatedAt,
        ActivatedAt = e.ActivatedAt,
        ExpiredAt = e.ExpiredAt,
        State = (KeyVersionState)e.State
    };

    private static KeyVersionEntity MapToEntity(KeyVersion d) => new()
    {
        Id = d.Id,
        KeySetId = d.KeySetId,
        Kid = d.Kid,
        Algorithm = d.Algorithm,
        KeyMaterial = d.KeyMaterial,
        CreatedAt = d.CreatedAt,
        ActivatedAt = d.ActivatedAt,
        ExpiredAt = d.ExpiredAt,
        State = (int)d.State
    };
}
