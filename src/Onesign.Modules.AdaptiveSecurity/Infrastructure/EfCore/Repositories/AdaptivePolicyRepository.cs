using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Onesign.Modules.AdaptiveSecurity.Domain.Entities;
using Onesign.Modules.AdaptiveSecurity.Domain.Enums;
using Onesign.Modules.AdaptiveSecurity.Domain.Repositories;
using Onesign.Modules.AdaptiveSecurity.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.AdaptiveSecurity.Infrastructure.EfCore.Repositories;

public class AdaptivePolicyRepository : IAdaptivePolicyRepository
{
    private readonly DbContext _dbContext;

    public AdaptivePolicyRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<AdaptivePolicy?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<AdaptivePolicyEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, ct);
        return entity == null ? null : MapToDomain(entity);
    }

    public async Task<IReadOnlyList<AdaptivePolicy>> GetByTenantAsync(Guid tenantId, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<AdaptivePolicyEntity>()
            .Where(x => x.TenantId == tenantId)
            .OrderBy(x => x.Priority)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<AdaptivePolicy>> GetEnabledPoliciesAsync(Guid tenantId, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<AdaptivePolicyEntity>()
            .Where(x => x.TenantId == tenantId && x.IsEnabled)
            .OrderBy(x => x.Priority)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task AddAsync(AdaptivePolicy policy, CancellationToken ct = default)
    {
        var entity = MapToEntity(policy);
        await _dbContext.Set<AdaptivePolicyEntity>().AddAsync(entity, ct);
        await _dbContext.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(AdaptivePolicy policy, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<AdaptivePolicyEntity>()
            .FirstOrDefaultAsync(x => x.Id == policy.Id, ct);
        if (entity != null)
        {
            entity.Name = policy.Name;
            entity.Description = policy.Description;
            entity.Conditions = policy.Conditions;
            entity.ActionsJson = JsonSerializer.Serialize(policy.Actions);
            entity.RiskThreshold = (int)policy.RiskThreshold;
            entity.IsEnabled = policy.IsEnabled;
            entity.Priority = policy.Priority;
            entity.UpdatedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync(ct);
        }
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<AdaptivePolicyEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity != null)
        {
            _dbContext.Set<AdaptivePolicyEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(ct);
        }
    }

    private static AdaptivePolicy MapToDomain(AdaptivePolicyEntity entity) => new()
    {
        Id = entity.Id,
        TenantId = entity.TenantId,
        Name = entity.Name,
        Description = entity.Description,
        Conditions = entity.Conditions,
        Actions = JsonSerializer.Deserialize<List<AdaptiveActionType>>(entity.ActionsJson) ?? new(),
        RiskThreshold = (RiskLevel)entity.RiskThreshold,
        IsEnabled = entity.IsEnabled,
        Priority = entity.Priority,
        CreatedAt = entity.CreatedAt,
        UpdatedAt = entity.UpdatedAt
    };

    private static AdaptivePolicyEntity MapToEntity(AdaptivePolicy policy) => new()
    {
        Id = policy.Id,
        TenantId = policy.TenantId,
        Name = policy.Name,
        Description = policy.Description,
        Conditions = policy.Conditions,
        ActionsJson = JsonSerializer.Serialize(policy.Actions),
        RiskThreshold = (int)policy.RiskThreshold,
        IsEnabled = policy.IsEnabled,
        Priority = policy.Priority,
        CreatedAt = policy.CreatedAt,
        UpdatedAt = policy.UpdatedAt
    };
}
