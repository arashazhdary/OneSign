using MediatR;
using Onesign.Modules.Automation.Application.Commands;
using Onesign.Modules.Automation.Application.DTOs;
using Onesign.Modules.Automation.Domain.Entities;
using Onesign.Modules.Automation.Domain.Enums;
using Onesign.Modules.Automation.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Automation.Application.Handlers;

public class CreateGlobalTemplateCommandHandler : IRequestHandler<CreateGlobalTemplateCommand, Result<AutomationWorkflowDto>>
{
    private readonly IAutomationWorkflowRepository _repository;

    public CreateGlobalTemplateCommandHandler(IAutomationWorkflowRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<AutomationWorkflowDto>> Handle(CreateGlobalTemplateCommand request, CancellationToken cancellationToken)
    {
        var workflow = new AutomationWorkflow
        {
            Id = Guid.NewGuid(),
            TenantId = null,
            Name = request.Name,
            Description = request.Description,
            ScopeType = WorkflowScopeType.Global,
            IsTemplate = true,
            IsEnabled = false,
            Severity = Enum.TryParse<WorkflowSeverity>(request.Severity, true, out var sev) ? sev : WorkflowSeverity.Info,
            TenantCanDisable = request.TenantCanDisable,
            TenantCanOverrideConditions = request.TenantCanOverrideConditions,
            CreatedAt = DateTimeOffset.UtcNow,
            CreatedByUserId = request.UserId
        };

        foreach (var trigger in request.Triggers)
        {
            workflow.Triggers.Add(new AutomationTrigger
            {
                Id = Guid.NewGuid(),
                WorkflowId = workflow.Id,
                EventType = trigger.EventType,
                SourceModule = trigger.SourceModule
            });
        }

        foreach (var condition in request.Conditions)
        {
            workflow.Conditions.Add(new AutomationCondition
            {
                Id = Guid.NewGuid(),
                WorkflowId = workflow.Id,
                ExpressionType = Enum.TryParse<ExpressionType>(condition.ExpressionType, true, out var et) ? et : ExpressionType.JsonLogic,
                Expression = condition.Expression,
                Order = condition.Order
            });
        }

        foreach (var action in request.Actions)
        {
            workflow.Actions.Add(new AutomationAction
            {
                Id = Guid.NewGuid(),
                WorkflowId = workflow.Id,
                ActionType = Enum.TryParse<ActionType>(action.ActionType, true, out var at) ? at : ActionType.SendEmail,
                Order = action.Order,
                ConfigJson = action.ConfigJson,
                IsCritical = action.IsCritical
            });
        }

        await _repository.AddAsync(workflow, cancellationToken);

        return Result.Success(MapToDto(workflow));
    }

    private static AutomationWorkflowDto MapToDto(AutomationWorkflow w) => new()
    {
        Id = w.Id,
        TenantId = w.TenantId,
        Name = w.Name,
        Description = w.Description,
        ScopeType = w.ScopeType.ToString(),
        IsTemplate = w.IsTemplate,
        IsEnabled = w.IsEnabled,
        Severity = w.Severity.ToString(),
        IsEnforced = w.IsEnforced,
        TenantCanDisable = w.TenantCanDisable,
        TenantCanOverrideConditions = w.TenantCanOverrideConditions,
        CreatedAt = w.CreatedAt,
        CreatedByUserId = w.CreatedByUserId,
        UpdatedAt = w.UpdatedAt,
        UpdatedByUserId = w.UpdatedByUserId,
        Triggers = w.Triggers.Select(t => new AutomationTriggerDto { Id = t.Id, EventType = t.EventType, SourceModule = t.SourceModule }).ToList(),
        Conditions = w.Conditions.Select(c => new AutomationConditionDto { Id = c.Id, ExpressionType = c.ExpressionType.ToString(), Expression = c.Expression, Order = c.Order }).ToList(),
        Actions = w.Actions.Select(a => new AutomationActionDto { Id = a.Id, ActionType = a.ActionType.ToString(), Order = a.Order, ConfigJson = a.ConfigJson, IsCritical = a.IsCritical }).ToList()
    };
}

public class UpdateGlobalTemplateCommandHandler : IRequestHandler<UpdateGlobalTemplateCommand, Result<AutomationWorkflowDto>>
{
    private readonly IAutomationWorkflowRepository _repository;

    public UpdateGlobalTemplateCommandHandler(IAutomationWorkflowRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<AutomationWorkflowDto>> Handle(UpdateGlobalTemplateCommand request, CancellationToken cancellationToken)
    {
        var workflow = await _repository.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        if (workflow == null || workflow.TenantId != null || !workflow.IsTemplate)
            return Result.Failure<AutomationWorkflowDto>("NotFound", "Template not found");

        workflow.Name = request.Name;
        workflow.Description = request.Description;
        workflow.Severity = Enum.TryParse<WorkflowSeverity>(request.Severity, true, out var sev) ? sev : WorkflowSeverity.Info;
        workflow.TenantCanDisable = request.TenantCanDisable;
        workflow.TenantCanOverrideConditions = request.TenantCanOverrideConditions;
        workflow.UpdatedAt = DateTimeOffset.UtcNow;
        workflow.UpdatedByUserId = request.UserId;

        workflow.Triggers.Clear();
        foreach (var trigger in request.Triggers)
        {
            workflow.Triggers.Add(new AutomationTrigger { Id = Guid.NewGuid(), WorkflowId = workflow.Id, EventType = trigger.EventType, SourceModule = trigger.SourceModule });
        }

        workflow.Conditions.Clear();
        foreach (var condition in request.Conditions)
        {
            workflow.Conditions.Add(new AutomationCondition { Id = Guid.NewGuid(), WorkflowId = workflow.Id, ExpressionType = Enum.TryParse<ExpressionType>(condition.ExpressionType, true, out var et) ? et : ExpressionType.JsonLogic, Expression = condition.Expression, Order = condition.Order });
        }

        workflow.Actions.Clear();
        foreach (var action in request.Actions)
        {
            workflow.Actions.Add(new AutomationAction { Id = Guid.NewGuid(), WorkflowId = workflow.Id, ActionType = Enum.TryParse<ActionType>(action.ActionType, true, out var at) ? at : ActionType.SendEmail, Order = action.Order, ConfigJson = action.ConfigJson, IsCritical = action.IsCritical });
        }

        await _repository.UpdateAsync(workflow, cancellationToken);

        return Result.Success(MapToDto(workflow));
    }

    private static AutomationWorkflowDto MapToDto(AutomationWorkflow w) => new()
    {
        Id = w.Id, TenantId = w.TenantId, Name = w.Name, Description = w.Description, ScopeType = w.ScopeType.ToString(), IsTemplate = w.IsTemplate, IsEnabled = w.IsEnabled, Severity = w.Severity.ToString(), IsEnforced = w.IsEnforced, TenantCanDisable = w.TenantCanDisable, TenantCanOverrideConditions = w.TenantCanOverrideConditions, CreatedAt = w.CreatedAt, CreatedByUserId = w.CreatedByUserId, UpdatedAt = w.UpdatedAt, UpdatedByUserId = w.UpdatedByUserId,
        Triggers = w.Triggers.Select(t => new AutomationTriggerDto { Id = t.Id, EventType = t.EventType, SourceModule = t.SourceModule }).ToList(),
        Conditions = w.Conditions.Select(c => new AutomationConditionDto { Id = c.Id, ExpressionType = c.ExpressionType.ToString(), Expression = c.Expression, Order = c.Order }).ToList(),
        Actions = w.Actions.Select(a => new AutomationActionDto { Id = a.Id, ActionType = a.ActionType.ToString(), Order = a.Order, ConfigJson = a.ConfigJson, IsCritical = a.IsCritical }).ToList()
    };
}

public class DeleteGlobalTemplateCommandHandler : IRequestHandler<DeleteGlobalTemplateCommand, Result>
{
    private readonly IAutomationWorkflowRepository _repository;

    public DeleteGlobalTemplateCommandHandler(IAutomationWorkflowRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result> Handle(DeleteGlobalTemplateCommand request, CancellationToken cancellationToken)
    {
        var workflow = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (workflow == null || workflow.TenantId != null || !workflow.IsTemplate)
            return Result.Failure("NotFound", "Template not found");

        await _repository.DeleteAsync(request.Id, cancellationToken);
        return Result.Success();
    }
}

public class PublishTemplateCommandHandler : IRequestHandler<PublishTemplateCommand, Result>
{
    private readonly IAutomationWorkflowRepository _repository;

    public PublishTemplateCommandHandler(IAutomationWorkflowRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result> Handle(PublishTemplateCommand request, CancellationToken cancellationToken)
    {
        var workflow = await _repository.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        if (workflow == null || workflow.TenantId != null || !workflow.IsTemplate)
            return Result.Failure("NotFound", "Template not found");

        workflow.IsEnabled = true;
        workflow.UpdatedAt = DateTimeOffset.UtcNow;
        workflow.UpdatedByUserId = request.UserId;

        await _repository.UpdateAsync(workflow, cancellationToken);
        return Result.Success();
    }
}

public class EnforceTemplateCommandHandler : IRequestHandler<EnforceTemplateCommand, Result>
{
    private readonly IAutomationWorkflowRepository _repository;

    public EnforceTemplateCommandHandler(IAutomationWorkflowRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result> Handle(EnforceTemplateCommand request, CancellationToken cancellationToken)
    {
        var workflow = await _repository.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        if (workflow == null || workflow.TenantId != null || !workflow.IsTemplate)
            return Result.Failure("NotFound", "Template not found");

        workflow.IsEnforced = true;
        workflow.IsEnabled = true;
        workflow.UpdatedAt = DateTimeOffset.UtcNow;
        workflow.UpdatedByUserId = request.UserId;

        await _repository.UpdateAsync(workflow, cancellationToken);
        return Result.Success();
    }
}

public class UnenforceTemplateCommandHandler : IRequestHandler<UnenforceTemplateCommand, Result>
{
    private readonly IAutomationWorkflowRepository _repository;

    public UnenforceTemplateCommandHandler(IAutomationWorkflowRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result> Handle(UnenforceTemplateCommand request, CancellationToken cancellationToken)
    {
        var workflow = await _repository.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        if (workflow == null || workflow.TenantId != null || !workflow.IsTemplate)
            return Result.Failure("NotFound", "Template not found");

        workflow.IsEnforced = false;
        workflow.UpdatedAt = DateTimeOffset.UtcNow;
        workflow.UpdatedByUserId = request.UserId;

        await _repository.UpdateAsync(workflow, cancellationToken);
        return Result.Success();
    }
}

public class CloneTemplateCommandHandler : IRequestHandler<CloneTemplateCommand, Result<AutomationWorkflowDto>>
{
    private readonly IAutomationWorkflowRepository _repository;

    public CloneTemplateCommandHandler(IAutomationWorkflowRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<AutomationWorkflowDto>> Handle(CloneTemplateCommand request, CancellationToken cancellationToken)
    {
        var template = await _repository.GetByIdWithDetailsAsync(request.TemplateId, cancellationToken);
        if (template == null || template.TenantId != null || !template.IsTemplate)
            return Result.Failure<AutomationWorkflowDto>("NotFound", "Template not found");

        var workflow = new AutomationWorkflow
        {
            Id = Guid.NewGuid(),
            TenantId = request.TenantId,
            Name = request.CustomName ?? $"{template.Name} (Copy)",
            Description = template.Description,
            ScopeType = WorkflowScopeType.Tenant,
            IsTemplate = false,
            IsEnabled = false,
            Severity = template.Severity,
            CreatedAt = DateTimeOffset.UtcNow,
            CreatedByUserId = request.UserId
        };

        foreach (var trigger in template.Triggers)
        {
            workflow.Triggers.Add(new AutomationTrigger { Id = Guid.NewGuid(), WorkflowId = workflow.Id, EventType = trigger.EventType, SourceModule = trigger.SourceModule });
        }

        foreach (var condition in template.Conditions)
        {
            workflow.Conditions.Add(new AutomationCondition { Id = Guid.NewGuid(), WorkflowId = workflow.Id, ExpressionType = condition.ExpressionType, Expression = condition.Expression, Order = condition.Order });
        }

        foreach (var action in template.Actions)
        {
            workflow.Actions.Add(new AutomationAction { Id = Guid.NewGuid(), WorkflowId = workflow.Id, ActionType = action.ActionType, Order = action.Order, ConfigJson = action.ConfigJson, IsCritical = action.IsCritical });
        }

        await _repository.AddAsync(workflow, cancellationToken);

        return Result.Success(new AutomationWorkflowDto
        {
            Id = workflow.Id, TenantId = workflow.TenantId, Name = workflow.Name, Description = workflow.Description, ScopeType = workflow.ScopeType.ToString(), IsTemplate = workflow.IsTemplate, IsEnabled = workflow.IsEnabled, Severity = workflow.Severity.ToString(), IsEnforced = workflow.IsEnforced, TenantCanDisable = workflow.TenantCanDisable, TenantCanOverrideConditions = workflow.TenantCanOverrideConditions, CreatedAt = workflow.CreatedAt, CreatedByUserId = workflow.CreatedByUserId,
            Triggers = workflow.Triggers.Select(t => new AutomationTriggerDto { Id = t.Id, EventType = t.EventType, SourceModule = t.SourceModule }).ToList(),
            Conditions = workflow.Conditions.Select(c => new AutomationConditionDto { Id = c.Id, ExpressionType = c.ExpressionType.ToString(), Expression = c.Expression, Order = c.Order }).ToList(),
            Actions = workflow.Actions.Select(a => new AutomationActionDto { Id = a.Id, ActionType = a.ActionType.ToString(), Order = a.Order, ConfigJson = a.ConfigJson, IsCritical = a.IsCritical }).ToList()
        });
    }
}
