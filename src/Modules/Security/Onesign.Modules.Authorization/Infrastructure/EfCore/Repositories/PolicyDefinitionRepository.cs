using Microsoft.EntityFrameworkCore;
using Onesign.Api.Data;
using Onesign.Modules.Authorization.Domain.Entities;
using Onesign.Modules.Authorization.Domain.Repositories;
using Onesign.Modules.Authorization.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Authorization.Infrastructure.EfCore.Repositories;

public class PolicyDefinitionRepository : IPolicyDefinitionRepository
{
    private readonly OnesignDbContext _dbContext;

    public PolicyDefinitionRepository(OnesignDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<PolicyDefinition?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<PolicyDefinitionEntity>()
            .Include(x => x.ConditionGroups)
                .ThenInclude(x => x.Conditions)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity == null ? null : MapToDomain(entity);
    }

    public async Task<List<PolicyDefinition>> GetByTenantIdAsync(Guid tenantId, bool? enabled = null, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Set<PolicyDefinitionEntity>()
            .Include(x => x.ConditionGroups)
                .ThenInclude(x => x.Conditions)
            .Where(x => x.TenantId == tenantId);

        if (enabled.HasValue)
        {
            query = query.Where(x => x.Enabled == enabled.Value);
        }

        var entities = await query
            .OrderByDescending(x => x.Priority)
            .ThenBy(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<PolicyDefinition> AddAsync(PolicyDefinition policy, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(policy);
        _dbContext.Set<PolicyDefinitionEntity>().Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return MapToDomain(entity);
    }

    public async Task UpdateAsync(PolicyDefinition policy, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<PolicyDefinitionEntity>()
            .Include(x => x.ConditionGroups)
                .ThenInclude(x => x.Conditions)
            .FirstOrDefaultAsync(x => x.Id == policy.Id, cancellationToken);

        if (entity == null)
            throw new InvalidOperationException($"PolicyDefinition with id {policy.Id} not found");

        // Update properties
        entity.Name = policy.Name;
        entity.Description = policy.Description;
        entity.Effect = policy.Effect;
        entity.Priority = policy.Priority;
        entity.Enabled = policy.Enabled;
        entity.UpdatedAt = policy.UpdatedAt;

        // Remove existing condition groups
        _dbContext.Set<PolicyConditionGroupEntity>().RemoveRange(entity.ConditionGroups);

        // Add new condition groups
        entity.ConditionGroups = policy.ConditionGroups.Select(g => new PolicyConditionGroupEntity
        {
            Id = g.Id,
            PolicyDefinitionId = policy.Id,
            LogicalOperator = g.LogicalOperator,
            Conditions = g.Conditions.Select(c => new PolicyConditionEntity
            {
                Id = c.Id,
                ConditionGroupId = g.Id,
                SourceType = c.SourceType,
                SourceKey = c.SourceKey,
                Operator = c.Operator,
                Value = c.Value
            }).ToList()
        }).ToList();

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<PolicyDefinitionEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity != null)
        {
            _dbContext.Set<PolicyDefinitionEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    private static PolicyDefinition MapToDomain(PolicyDefinitionEntity entity)
    {
        return new PolicyDefinition
        {
            Id = entity.Id,
            TenantId = entity.TenantId,
            Name = entity.Name,
            Description = entity.Description,
            Effect = entity.Effect,
            Priority = entity.Priority,
            Enabled = entity.Enabled,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            ConditionGroups = entity.ConditionGroups?.Select(g => new PolicyConditionGroup
            {
                Id = g.Id,
                PolicyDefinitionId = g.PolicyDefinitionId,
                LogicalOperator = g.LogicalOperator,
                Conditions = g.Conditions?.Select(c => new PolicyCondition
                {
                    Id = c.Id,
                    ConditionGroupId = c.ConditionGroupId,
                    SourceType = c.SourceType,
                    SourceKey = c.SourceKey,
                    Operator = c.Operator,
                    Value = c.Value
                }).ToList() ?? new List<PolicyCondition>()
            }).ToList() ?? new List<PolicyConditionGroup>()
        };
    }

    private static PolicyDefinitionEntity MapToEntity(PolicyDefinition policy)
    {
        return new PolicyDefinitionEntity
        {
            Id = policy.Id,
            TenantId = policy.TenantId,
            Name = policy.Name,
            Description = policy.Description,
            Effect = policy.Effect,
            Priority = policy.Priority,
            Enabled = policy.Enabled,
            CreatedAt = policy.CreatedAt,
            UpdatedAt = policy.UpdatedAt,
            ConditionGroups = policy.ConditionGroups?.Select(g => new PolicyConditionGroupEntity
            {
                Id = g.Id,
                PolicyDefinitionId = policy.Id,
                LogicalOperator = g.LogicalOperator,
                Conditions = g.Conditions?.Select(c => new PolicyConditionEntity
                {
                    Id = c.Id,
                    ConditionGroupId = g.Id,
                    SourceType = c.SourceType,
                    SourceKey = c.SourceKey,
                    Operator = c.Operator,
                    Value = c.Value
                }).ToList() ?? new List<PolicyConditionEntity>()
            }).ToList() ?? new List<PolicyConditionGroupEntity>()
        };
    }
}
