using Microsoft.EntityFrameworkCore;
using Onesign.Api.Data;
using Onesign.Modules.Authorization.Domain.Entities;
using Onesign.Modules.Authorization.Domain.Enums;
using Onesign.Modules.Authorization.Domain.Repositories;
using Onesign.Modules.Authorization.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Authorization.Infrastructure.EfCore.Repositories;

public class PolicyAssignmentRepository : IPolicyAssignmentRepository
{
    private readonly OnesignDbContext _dbContext;

    public PolicyAssignmentRepository(OnesignDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<PolicyAssignment>> GetByTargetAsync(
        Guid tenantId,
        string targetKey,
        PolicyTargetType targetType,
        CancellationToken cancellationToken = default)
    {
        var target = await _dbContext.Set<PolicyTargetEntity>()
            .FirstOrDefaultAsync(x => x.TenantId == tenantId && x.TargetKey == targetKey && x.TargetType == targetType, cancellationToken);

        if (target == null)
            return new List<PolicyAssignment>();

        var entities = await _dbContext.Set<PolicyAssignmentEntity>()
            .Include(x => x.PolicyDefinition)
                .ThenInclude(x => x!.ConditionGroups)
                    .ThenInclude(x => x.Conditions)
            .Include(x => x.PolicyTarget)
            .Where(x => x.PolicyTargetId == target.Id)
            .OrderBy(x => x.Order)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<List<PolicyAssignment>> GetByPolicyIdAsync(Guid policyId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<PolicyAssignmentEntity>()
            .Include(x => x.PolicyDefinition)
            .Include(x => x.PolicyTarget)
            .Where(x => x.PolicyDefinitionId == policyId)
            .OrderBy(x => x.Order)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<PolicyAssignment> AddAsync(PolicyAssignment assignment, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(assignment);
        _dbContext.Set<PolicyAssignmentEntity>().Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return MapToDomain(entity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<PolicyAssignmentEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity != null)
        {
            _dbContext.Set<PolicyAssignmentEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task UpdateOrderAsync(List<PolicyAssignment> assignments, CancellationToken cancellationToken = default)
    {
        foreach (var assignment in assignments)
        {
            var entity = await _dbContext.Set<PolicyAssignmentEntity>()
                .FirstOrDefaultAsync(x => x.Id == assignment.Id, cancellationToken);

            if (entity != null)
            {
                entity.Order = assignment.Order;
            }
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private static PolicyAssignment MapToDomain(PolicyAssignmentEntity entity)
    {
        return new PolicyAssignment
        {
            Id = entity.Id,
            TenantId = entity.TenantId,
            PolicyDefinitionId = entity.PolicyDefinitionId,
            PolicyTargetId = entity.PolicyTargetId,
            Order = entity.Order,
            CreatedAt = entity.CreatedAt,
            PolicyDefinition = entity.PolicyDefinition == null ? null : new PolicyDefinition
            {
                Id = entity.PolicyDefinition.Id,
                TenantId = entity.PolicyDefinition.TenantId,
                Name = entity.PolicyDefinition.Name,
                Description = entity.PolicyDefinition.Description,
                Effect = entity.PolicyDefinition.Effect,
                Priority = entity.PolicyDefinition.Priority,
                Enabled = entity.PolicyDefinition.Enabled,
                CreatedAt = entity.PolicyDefinition.CreatedAt,
                UpdatedAt = entity.PolicyDefinition.UpdatedAt,
                ConditionGroups = entity.PolicyDefinition.ConditionGroups?.Select(g => new PolicyConditionGroup
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
            },
            PolicyTarget = entity.PolicyTarget == null ? null : new PolicyTarget
            {
                Id = entity.PolicyTarget.Id,
                TenantId = entity.PolicyTarget.TenantId,
                TargetType = entity.PolicyTarget.TargetType,
                TargetKey = entity.PolicyTarget.TargetKey,
                TargetName = entity.PolicyTarget.TargetName,
                CreatedAt = entity.PolicyTarget.CreatedAt
            }
        };
    }

    private static PolicyAssignmentEntity MapToEntity(PolicyAssignment assignment)
    {
        return new PolicyAssignmentEntity
        {
            Id = assignment.Id,
            TenantId = assignment.TenantId,
            PolicyDefinitionId = assignment.PolicyDefinitionId,
            PolicyTargetId = assignment.PolicyTargetId,
            Order = assignment.Order,
            CreatedAt = assignment.CreatedAt
        };
    }
}
