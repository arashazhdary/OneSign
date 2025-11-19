using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Extensibility.Domain.Entities;
using Onesign.Modules.Extensibility.Domain.Repositories;
using Onesign.Modules.Extensibility.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Extensibility.Infrastructure.EfCore.Repositories;

public class TokenTransformationRuleRepository : ITokenTransformationRuleRepository
{
    private readonly DbContext _dbContext;

    public TokenTransformationRuleRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<TokenTransformationRule?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<TokenTransformationRuleEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, ct);
        return entity == null ? null : MapToDomain(entity);
    }

    public async Task<IReadOnlyList<TokenTransformationRule>> GetByTenantIdAsync(Guid tenantId, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<TokenTransformationRuleEntity>()
            .Where(x => x.TenantId == tenantId)
            .OrderBy(x => x.Order)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<TokenTransformationRule>> GetByAppIdAsync(Guid tenantId, Guid? appId, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<TokenTransformationRuleEntity>()
            .Where(x => x.TenantId == tenantId && x.IsEnabled && (x.TargetAppId == null || x.TargetAppId == appId))
            .OrderBy(x => x.Order)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<TokenTransformationRule>> GetEnabledByTenantIdAsync(Guid tenantId, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<TokenTransformationRuleEntity>()
            .Where(x => x.TenantId == tenantId && x.IsEnabled)
            .OrderBy(x => x.Order)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task AddAsync(TokenTransformationRule rule, CancellationToken ct = default)
    {
        var entity = MapToEntity(rule);
        await _dbContext.Set<TokenTransformationRuleEntity>().AddAsync(entity, ct);
        await _dbContext.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(TokenTransformationRule rule, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<TokenTransformationRuleEntity>()
            .FirstOrDefaultAsync(x => x.Id == rule.Id, ct);
        if (entity != null)
        {
            entity.Name = rule.Name;
            entity.TargetAppId = rule.TargetAppId;
            entity.Order = rule.Order;
            entity.RuleDefinitionJson = rule.RuleDefinitionJson;
            entity.IsEnabled = rule.IsEnabled;
            await _dbContext.SaveChangesAsync(ct);
        }
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<TokenTransformationRuleEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity != null)
        {
            _dbContext.Set<TokenTransformationRuleEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(ct);
        }
    }

    private static TokenTransformationRule MapToDomain(TokenTransformationRuleEntity entity) => new()
    {
        Id = entity.Id,
        TenantId = entity.TenantId,
        Name = entity.Name,
        TargetAppId = entity.TargetAppId,
        Order = entity.Order,
        RuleDefinitionJson = entity.RuleDefinitionJson,
        IsEnabled = entity.IsEnabled,
        CreatedAt = entity.CreatedAt
    };

    private static TokenTransformationRuleEntity MapToEntity(TokenTransformationRule rule) => new()
    {
        Id = rule.Id,
        TenantId = rule.TenantId,
        Name = rule.Name,
        TargetAppId = rule.TargetAppId,
        Order = rule.Order,
        RuleDefinitionJson = rule.RuleDefinitionJson,
        IsEnabled = rule.IsEnabled,
        CreatedAt = rule.CreatedAt
    };
}
