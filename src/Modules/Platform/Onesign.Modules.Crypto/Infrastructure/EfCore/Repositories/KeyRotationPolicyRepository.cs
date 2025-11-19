using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Crypto.Domain.Entities;
using Onesign.Modules.Crypto.Domain.Enums;
using Onesign.Modules.Crypto.Domain.Repositories;
using Onesign.Modules.Crypto.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Crypto.Infrastructure.EfCore.Repositories;

public class KeyRotationPolicyRepository : IKeyRotationPolicyRepository
{
    private readonly DbContext _dbContext;

    public KeyRotationPolicyRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<KeyRotationPolicy?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<KeyRotationPolicyEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<KeyRotationPolicy?> GetByScopeAndPurposeAsync(KeyScopeType scopeType, string scopeId, KeyPurpose purpose, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<KeyRotationPolicyEntity>()
            .FirstOrDefaultAsync(x => x.ScopeType == (int)scopeType && x.ScopeId == scopeId && x.Purpose == (int)purpose, cancellationToken);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<IEnumerable<KeyRotationPolicy>> GetEnabledAsync(CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<KeyRotationPolicyEntity>()
            .Where(x => x.Enabled)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IEnumerable<KeyRotationPolicy>> GetByScopeAsync(KeyScopeType scopeType, string scopeId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<KeyRotationPolicyEntity>()
            .Where(x => x.ScopeType == (int)scopeType && x.ScopeId == scopeId)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<KeyRotationPolicy?> GetByKeySetIdAsync(Guid keySetId, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<KeyRotationPolicyEntity>()
            .FirstOrDefaultAsync(x => x.ScopeId == keySetId.ToString(), cancellationToken);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<IEnumerable<KeyRotationPolicy>> GetEnabledPoliciesAsync(CancellationToken cancellationToken = default)
    {
        return await GetEnabledAsync(cancellationToken);
    }

    public async Task AddAsync(KeyRotationPolicy policy, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(policy);
        await _dbContext.Set<KeyRotationPolicyEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(KeyRotationPolicy policy, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<KeyRotationPolicyEntity>()
            .FirstOrDefaultAsync(x => x.Id == policy.Id, cancellationToken);

        if (entity != null)
        {
            entity.RotationPeriodDays = policy.RotationPeriodDays;
            entity.OverlapPeriodDays = policy.OverlapPeriodDays;
            entity.Enabled = policy.Enabled;
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<KeyRotationPolicyEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity != null)
        {
            _dbContext.Set<KeyRotationPolicyEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    private static KeyRotationPolicy MapToDomain(KeyRotationPolicyEntity e) => new()
    {
        Id = e.Id,
        ScopeType = (KeyScopeType)e.ScopeType,
        ScopeId = e.ScopeId,
        Purpose = (KeyPurpose)e.Purpose,
        RotationPeriodDays = e.RotationPeriodDays,
        OverlapPeriodDays = e.OverlapPeriodDays,
        Enabled = e.Enabled
    };

    private static KeyRotationPolicyEntity MapToEntity(KeyRotationPolicy d) => new()
    {
        Id = d.Id,
        ScopeType = (int)d.ScopeType,
        ScopeId = d.ScopeId,
        Purpose = (int)d.Purpose,
        RotationPeriodDays = d.RotationPeriodDays,
        OverlapPeriodDays = d.OverlapPeriodDays,
        Enabled = d.Enabled
    };
}
