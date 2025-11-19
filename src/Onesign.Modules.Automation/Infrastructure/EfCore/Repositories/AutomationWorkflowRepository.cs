using Microsoft.EntityFrameworkCore;
using Onesign.Api.Data;
using Onesign.Modules.Automation.Domain.Entities;
using Onesign.Modules.Automation.Domain.Enums;
using Onesign.Modules.Automation.Domain.Repositories;
using Onesign.Modules.Automation.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Automation.Infrastructure.EfCore.Repositories;

public class AutomationWorkflowRepository : IAutomationWorkflowRepository
{
    private readonly OnesignDbContext _dbContext;

    public AutomationWorkflowRepository(OnesignDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<AutomationWorkflow?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<AutomationWorkflowEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<AutomationWorkflow?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<AutomationWorkflowEntity>()
            .Include(x => x.Triggers)
            .Include(x => x.Conditions)
            .Include(x => x.Actions)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity != null ? MapToDomainWithDetails(entity) : null;
    }

    public async Task<IReadOnlyList<AutomationWorkflow>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<AutomationWorkflowEntity>()
            .Include(x => x.Triggers)
            .Include(x => x.Actions)
            .Where(x => x.TenantId == tenantId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomainWithDetails).ToList();
    }

    public async Task<IReadOnlyList<AutomationWorkflow>> GetGlobalTemplatesAsync(CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<AutomationWorkflowEntity>()
            .Include(x => x.Triggers)
            .Include(x => x.Conditions)
            .Include(x => x.Actions)
            .Where(x => x.TenantId == null && x.ScopeType == (int)WorkflowScopeType.Global && x.IsTemplate)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomainWithDetails).ToList();
    }

    public async Task<IReadOnlyList<AutomationWorkflow>> GetEnforcedGlobalWorkflowsAsync(CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<AutomationWorkflowEntity>()
            .Include(x => x.Triggers)
            .Include(x => x.Conditions)
            .Include(x => x.Actions)
            .Where(x => x.TenantId == null && x.ScopeType == (int)WorkflowScopeType.Global && x.IsEnforced && x.IsEnabled)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomainWithDetails).ToList();
    }

    public async Task<IReadOnlyList<AutomationWorkflow>> GetByEventTypeAsync(Guid? tenantId, string eventType, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Set<AutomationWorkflowEntity>()
            .Include(x => x.Triggers)
            .Include(x => x.Conditions)
            .Include(x => x.Actions)
            .Where(x => x.IsEnabled && x.Triggers.Any(t => t.EventType == eventType));

        if (tenantId.HasValue)
        {
            query = query.Where(x => x.TenantId == tenantId || (x.TenantId == null && x.IsEnforced));
        }
        else
        {
            query = query.Where(x => x.TenantId == null && x.IsEnforced);
        }

        var entities = await query.ToListAsync(cancellationToken);
        return entities.Select(MapToDomainWithDetails).ToList();
    }

    public async Task AddAsync(AutomationWorkflow workflow, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(workflow);
        await _dbContext.Set<AutomationWorkflowEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(AutomationWorkflow workflow, CancellationToken cancellationToken = default)
    {
        var existing = await _dbContext.Set<AutomationWorkflowEntity>()
            .Include(x => x.Triggers)
            .Include(x => x.Conditions)
            .Include(x => x.Actions)
            .FirstOrDefaultAsync(x => x.Id == workflow.Id, cancellationToken);

        if (existing == null)
            return;

        existing.Name = workflow.Name;
        existing.Description = workflow.Description;
        existing.ScopeType = (int)workflow.ScopeType;
        existing.IsTemplate = workflow.IsTemplate;
        existing.IsEnabled = workflow.IsEnabled;
        existing.Severity = (int)workflow.Severity;
        existing.IsEnforced = workflow.IsEnforced;
        existing.TenantCanDisable = workflow.TenantCanDisable;
        existing.TenantCanOverrideConditions = workflow.TenantCanOverrideConditions;
        existing.UpdatedAt = workflow.UpdatedAt;
        existing.UpdatedByUserId = workflow.UpdatedByUserId;

        _dbContext.Set<AutomationTriggerEntity>().RemoveRange(existing.Triggers);
        _dbContext.Set<AutomationConditionEntity>().RemoveRange(existing.Conditions);
        _dbContext.Set<AutomationActionEntity>().RemoveRange(existing.Actions);

        foreach (var trigger in workflow.Triggers)
        {
            existing.Triggers.Add(new AutomationTriggerEntity
            {
                Id = trigger.Id,
                WorkflowId = workflow.Id,
                EventType = trigger.EventType,
                SourceModule = trigger.SourceModule
            });
        }

        foreach (var condition in workflow.Conditions)
        {
            existing.Conditions.Add(new AutomationConditionEntity
            {
                Id = condition.Id,
                WorkflowId = workflow.Id,
                ExpressionType = (int)condition.ExpressionType,
                Expression = condition.Expression,
                Order = condition.Order
            });
        }

        foreach (var action in workflow.Actions)
        {
            existing.Actions.Add(new AutomationActionEntity
            {
                Id = action.Id,
                WorkflowId = workflow.Id,
                ActionType = (int)action.ActionType,
                Order = action.Order,
                ConfigJson = action.ConfigJson,
                IsCritical = action.IsCritical
            });
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<AutomationWorkflowEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity != null)
        {
            _dbContext.Set<AutomationWorkflowEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    private static AutomationWorkflow MapToDomain(AutomationWorkflowEntity e) => new()
    {
        Id = e.Id,
        TenantId = e.TenantId,
        Name = e.Name,
        Description = e.Description,
        ScopeType = (WorkflowScopeType)e.ScopeType,
        IsTemplate = e.IsTemplate,
        IsEnabled = e.IsEnabled,
        Severity = (WorkflowSeverity)e.Severity,
        IsEnforced = e.IsEnforced,
        TenantCanDisable = e.TenantCanDisable,
        TenantCanOverrideConditions = e.TenantCanOverrideConditions,
        CreatedAt = e.CreatedAt,
        CreatedByUserId = e.CreatedByUserId,
        UpdatedAt = e.UpdatedAt,
        UpdatedByUserId = e.UpdatedByUserId
    };

    private static AutomationWorkflow MapToDomainWithDetails(AutomationWorkflowEntity e)
    {
        var workflow = MapToDomain(e);

        workflow.Triggers = e.Triggers.Select(t => new AutomationTrigger
        {
            Id = t.Id,
            WorkflowId = t.WorkflowId,
            EventType = t.EventType,
            SourceModule = t.SourceModule
        }).ToList();

        workflow.Conditions = e.Conditions.OrderBy(c => c.Order).Select(c => new AutomationCondition
        {
            Id = c.Id,
            WorkflowId = c.WorkflowId,
            ExpressionType = (ExpressionType)c.ExpressionType,
            Expression = c.Expression,
            Order = c.Order
        }).ToList();

        workflow.Actions = e.Actions.OrderBy(a => a.Order).Select(a => new AutomationAction
        {
            Id = a.Id,
            WorkflowId = a.WorkflowId,
            ActionType = (ActionType)a.ActionType,
            Order = a.Order,
            ConfigJson = a.ConfigJson,
            IsCritical = a.IsCritical
        }).ToList();

        return workflow;
    }

    private static AutomationWorkflowEntity MapToEntity(AutomationWorkflow d)
    {
        var entity = new AutomationWorkflowEntity
        {
            Id = d.Id,
            TenantId = d.TenantId,
            Name = d.Name,
            Description = d.Description,
            ScopeType = (int)d.ScopeType,
            IsTemplate = d.IsTemplate,
            IsEnabled = d.IsEnabled,
            Severity = (int)d.Severity,
            IsEnforced = d.IsEnforced,
            TenantCanDisable = d.TenantCanDisable,
            TenantCanOverrideConditions = d.TenantCanOverrideConditions,
            CreatedAt = d.CreatedAt,
            CreatedByUserId = d.CreatedByUserId,
            UpdatedAt = d.UpdatedAt,
            UpdatedByUserId = d.UpdatedByUserId
        };

        foreach (var trigger in d.Triggers)
        {
            entity.Triggers.Add(new AutomationTriggerEntity
            {
                Id = trigger.Id,
                WorkflowId = d.Id,
                EventType = trigger.EventType,
                SourceModule = trigger.SourceModule
            });
        }

        foreach (var condition in d.Conditions)
        {
            entity.Conditions.Add(new AutomationConditionEntity
            {
                Id = condition.Id,
                WorkflowId = d.Id,
                ExpressionType = (int)condition.ExpressionType,
                Expression = condition.Expression,
                Order = condition.Order
            });
        }

        foreach (var action in d.Actions)
        {
            entity.Actions.Add(new AutomationActionEntity
            {
                Id = action.Id,
                WorkflowId = d.Id,
                ActionType = (int)action.ActionType,
                Order = action.Order,
                ConfigJson = action.ConfigJson,
                IsCritical = action.IsCritical
            });
        }

        return entity;
    }
}
