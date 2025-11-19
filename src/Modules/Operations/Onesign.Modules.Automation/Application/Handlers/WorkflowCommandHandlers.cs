using System.Text.Json;
using MediatR;
using Onesign.Modules.Automation.Application.Commands;
using Onesign.Modules.Automation.Application.DTOs;
using Onesign.Modules.Automation.Domain.Entities;
using Onesign.Modules.Automation.Domain.Enums;
using Onesign.Modules.Automation.Domain.Repositories;
using Onesign.Modules.Automation.Domain.Services;
using Onesign.Shared.Result;

namespace Onesign.Modules.Automation.Application.Handlers;

public class CreateWorkflowCommandHandler : IRequestHandler<CreateWorkflowCommand, Result<AutomationWorkflowDto>>
{
    private readonly IAutomationWorkflowRepository _repository;

    public CreateWorkflowCommandHandler(IAutomationWorkflowRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<AutomationWorkflowDto>> Handle(CreateWorkflowCommand request, CancellationToken cancellationToken)
    {
        var workflow = new AutomationWorkflow
        {
            Id = Guid.NewGuid(),
            TenantId = request.TenantId,
            Name = request.Name,
            Description = request.Description,
            ScopeType = WorkflowScopeType.Tenant,
            IsTemplate = false,
            IsEnabled = request.IsEnabled,
            Severity = Enum.TryParse<WorkflowSeverity>(request.Severity, true, out var sev) ? sev : WorkflowSeverity.Info,
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
        Triggers = w.Triggers.Select(t => new AutomationTriggerDto
        {
            Id = t.Id,
            EventType = t.EventType,
            SourceModule = t.SourceModule
        }).ToList(),
        Conditions = w.Conditions.Select(c => new AutomationConditionDto
        {
            Id = c.Id,
            ExpressionType = c.ExpressionType.ToString(),
            Expression = c.Expression,
            Order = c.Order
        }).ToList(),
        Actions = w.Actions.Select(a => new AutomationActionDto
        {
            Id = a.Id,
            ActionType = a.ActionType.ToString(),
            Order = a.Order,
            ConfigJson = a.ConfigJson,
            IsCritical = a.IsCritical
        }).ToList()
    };
}

public class UpdateWorkflowCommandHandler : IRequestHandler<UpdateWorkflowCommand, Result<AutomationWorkflowDto>>
{
    private readonly IAutomationWorkflowRepository _repository;

    public UpdateWorkflowCommandHandler(IAutomationWorkflowRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<AutomationWorkflowDto>> Handle(UpdateWorkflowCommand request, CancellationToken cancellationToken)
    {
        var workflow = await _repository.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        if (workflow == null || workflow.TenantId != request.TenantId)
            return Result.Failure<AutomationWorkflowDto>("NotFound", "Workflow not found");

        workflow.Name = request.Name;
        workflow.Description = request.Description;
        workflow.Severity = Enum.TryParse<WorkflowSeverity>(request.Severity, true, out var sev) ? sev : WorkflowSeverity.Info;
        workflow.IsEnabled = request.IsEnabled;
        workflow.UpdatedAt = DateTimeOffset.UtcNow;
        workflow.UpdatedByUserId = request.UserId;

        workflow.Triggers.Clear();
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

        workflow.Conditions.Clear();
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

        workflow.Actions.Clear();
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

        await _repository.UpdateAsync(workflow, cancellationToken);

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
        Triggers = w.Triggers.Select(t => new AutomationTriggerDto
        {
            Id = t.Id,
            EventType = t.EventType,
            SourceModule = t.SourceModule
        }).ToList(),
        Conditions = w.Conditions.Select(c => new AutomationConditionDto
        {
            Id = c.Id,
            ExpressionType = c.ExpressionType.ToString(),
            Expression = c.Expression,
            Order = c.Order
        }).ToList(),
        Actions = w.Actions.Select(a => new AutomationActionDto
        {
            Id = a.Id,
            ActionType = a.ActionType.ToString(),
            Order = a.Order,
            ConfigJson = a.ConfigJson,
            IsCritical = a.IsCritical
        }).ToList()
    };
}

public class DeleteWorkflowCommandHandler : IRequestHandler<DeleteWorkflowCommand, Result>
{
    private readonly IAutomationWorkflowRepository _repository;

    public DeleteWorkflowCommandHandler(IAutomationWorkflowRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result> Handle(DeleteWorkflowCommand request, CancellationToken cancellationToken)
    {
        var workflow = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (workflow == null || workflow.TenantId != request.TenantId)
            return Result.Failure("NotFound", "Workflow not found");

        await _repository.DeleteAsync(request.Id, cancellationToken);
        return Result.Success();
    }
}

public class EnableWorkflowCommandHandler : IRequestHandler<EnableWorkflowCommand, Result>
{
    private readonly IAutomationWorkflowRepository _repository;

    public EnableWorkflowCommandHandler(IAutomationWorkflowRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result> Handle(EnableWorkflowCommand request, CancellationToken cancellationToken)
    {
        var workflow = await _repository.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        if (workflow == null || workflow.TenantId != request.TenantId)
            return Result.Failure("NotFound", "Workflow not found");

        workflow.IsEnabled = true;
        workflow.UpdatedAt = DateTimeOffset.UtcNow;
        workflow.UpdatedByUserId = request.UserId;

        await _repository.UpdateAsync(workflow, cancellationToken);
        return Result.Success();
    }
}

public class DisableWorkflowCommandHandler : IRequestHandler<DisableWorkflowCommand, Result>
{
    private readonly IAutomationWorkflowRepository _repository;

    public DisableWorkflowCommandHandler(IAutomationWorkflowRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result> Handle(DisableWorkflowCommand request, CancellationToken cancellationToken)
    {
        var workflow = await _repository.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        if (workflow == null || workflow.TenantId != request.TenantId)
            return Result.Failure("NotFound", "Workflow not found");

        workflow.IsEnabled = false;
        workflow.UpdatedAt = DateTimeOffset.UtcNow;
        workflow.UpdatedByUserId = request.UserId;

        await _repository.UpdateAsync(workflow, cancellationToken);
        return Result.Success();
    }
}

public class TestWorkflowCommandHandler : IRequestHandler<TestWorkflowCommand, Result<WorkflowTestResultDto>>
{
    private readonly IAutomationWorkflowRepository _repository;
    private readonly IConditionEvaluator _conditionEvaluator;

    public TestWorkflowCommandHandler(IAutomationWorkflowRepository repository, IConditionEvaluator conditionEvaluator)
    {
        _repository = repository;
        _conditionEvaluator = conditionEvaluator;
    }

    public async Task<Result<WorkflowTestResultDto>> Handle(TestWorkflowCommand request, CancellationToken cancellationToken)
    {
        var workflow = await _repository.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        if (workflow == null || workflow.TenantId != request.TenantId)
            return Result.Failure<WorkflowTestResultDto>("NotFound", "Workflow not found");

        var payload = JsonSerializer.Deserialize<Dictionary<string, object?>>(request.TestPayloadJson) ?? new();

        var result = new WorkflowTestResultDto();

        if (!payload.TryGetValue("eventType", out var eventTypeObj))
        {
            result.Matched = false;
            return Result.Success(result);
        }

        var eventType = eventTypeObj?.ToString() ?? "";
        var matchedTriggers = workflow.Triggers.Where(t => t.EventType == eventType).ToList();

        if (matchedTriggers.Any())
        {
            result.Matched = true;
            result.MatchedTriggers = matchedTriggers.Select(t => t.EventType).ToList();

            var conditionsPassed = true;
            foreach (var condition in workflow.Conditions.OrderBy(c => c.Order))
            {
                if (!_conditionEvaluator.Evaluate(condition.ExpressionType, condition.Expression, payload))
                {
                    conditionsPassed = false;
                    break;
                }
            }

            result.ConditionsPassed = conditionsPassed;

            if (conditionsPassed)
            {
                result.ActionsToExecute = workflow.Actions.OrderBy(a => a.Order).Select(a => new ActionTestResultDto
                {
                    ActionType = a.ActionType.ToString(),
                    Order = a.Order,
                    IsCritical = a.IsCritical
                }).ToList();
            }
        }

        return Result.Success(result);
    }
}
