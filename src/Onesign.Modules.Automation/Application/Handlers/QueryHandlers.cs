using MediatR;
using Onesign.Modules.Automation.Application.DTOs;
using Onesign.Modules.Automation.Application.Queries;
using Onesign.Modules.Automation.Domain.Constants;
using Onesign.Modules.Automation.Domain.Enums;
using Onesign.Modules.Automation.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Automation.Application.Handlers;

public class GetWorkflowsQueryHandler : IRequestHandler<GetWorkflowsQuery, Result<List<AutomationWorkflowDto>>>
{
    private readonly IAutomationWorkflowRepository _repository;

    public GetWorkflowsQueryHandler(IAutomationWorkflowRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<AutomationWorkflowDto>>> Handle(GetWorkflowsQuery request, CancellationToken cancellationToken)
    {
        var workflows = await _repository.GetByTenantIdAsync(request.TenantId, cancellationToken);
        var dtos = workflows.Select(w => new AutomationWorkflowDto
        {
            Id = w.Id, TenantId = w.TenantId, Name = w.Name, Description = w.Description, ScopeType = w.ScopeType.ToString(), IsTemplate = w.IsTemplate, IsEnabled = w.IsEnabled, Severity = w.Severity.ToString(), IsEnforced = w.IsEnforced, TenantCanDisable = w.TenantCanDisable, TenantCanOverrideConditions = w.TenantCanOverrideConditions, CreatedAt = w.CreatedAt, CreatedByUserId = w.CreatedByUserId, UpdatedAt = w.UpdatedAt, UpdatedByUserId = w.UpdatedByUserId,
            Triggers = w.Triggers.Select(t => new AutomationTriggerDto { Id = t.Id, EventType = t.EventType, SourceModule = t.SourceModule }).ToList(),
            Conditions = w.Conditions.Select(c => new AutomationConditionDto { Id = c.Id, ExpressionType = c.ExpressionType.ToString(), Expression = c.Expression, Order = c.Order }).ToList(),
            Actions = w.Actions.Select(a => new AutomationActionDto { Id = a.Id, ActionType = a.ActionType.ToString(), Order = a.Order, ConfigJson = a.ConfigJson, IsCritical = a.IsCritical }).ToList()
        }).ToList();

        return Result.Success(dtos);
    }
}

public class GetWorkflowByIdQueryHandler : IRequestHandler<GetWorkflowByIdQuery, Result<AutomationWorkflowDto>>
{
    private readonly IAutomationWorkflowRepository _repository;

    public GetWorkflowByIdQueryHandler(IAutomationWorkflowRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<AutomationWorkflowDto>> Handle(GetWorkflowByIdQuery request, CancellationToken cancellationToken)
    {
        var workflow = await _repository.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        if (workflow == null || workflow.TenantId != request.TenantId)
            return Result.Failure<AutomationWorkflowDto>("NotFound", "Workflow not found");

        return Result.Success(new AutomationWorkflowDto
        {
            Id = workflow.Id, TenantId = workflow.TenantId, Name = workflow.Name, Description = workflow.Description, ScopeType = workflow.ScopeType.ToString(), IsTemplate = workflow.IsTemplate, IsEnabled = workflow.IsEnabled, Severity = workflow.Severity.ToString(), IsEnforced = workflow.IsEnforced, TenantCanDisable = workflow.TenantCanDisable, TenantCanOverrideConditions = workflow.TenantCanOverrideConditions, CreatedAt = workflow.CreatedAt, CreatedByUserId = workflow.CreatedByUserId, UpdatedAt = workflow.UpdatedAt, UpdatedByUserId = workflow.UpdatedByUserId,
            Triggers = workflow.Triggers.Select(t => new AutomationTriggerDto { Id = t.Id, EventType = t.EventType, SourceModule = t.SourceModule }).ToList(),
            Conditions = workflow.Conditions.Select(c => new AutomationConditionDto { Id = c.Id, ExpressionType = c.ExpressionType.ToString(), Expression = c.Expression, Order = c.Order }).ToList(),
            Actions = workflow.Actions.Select(a => new AutomationActionDto { Id = a.Id, ActionType = a.ActionType.ToString(), Order = a.Order, ConfigJson = a.ConfigJson, IsCritical = a.IsCritical }).ToList()
        });
    }
}

public class GetGlobalTemplatesQueryHandler : IRequestHandler<GetGlobalTemplatesQuery, Result<List<AutomationWorkflowDto>>>
{
    private readonly IAutomationWorkflowRepository _repository;

    public GetGlobalTemplatesQueryHandler(IAutomationWorkflowRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<AutomationWorkflowDto>>> Handle(GetGlobalTemplatesQuery request, CancellationToken cancellationToken)
    {
        var templates = await _repository.GetGlobalTemplatesAsync(cancellationToken);
        var dtos = templates.Select(w => new AutomationWorkflowDto
        {
            Id = w.Id, TenantId = w.TenantId, Name = w.Name, Description = w.Description, ScopeType = w.ScopeType.ToString(), IsTemplate = w.IsTemplate, IsEnabled = w.IsEnabled, Severity = w.Severity.ToString(), IsEnforced = w.IsEnforced, TenantCanDisable = w.TenantCanDisable, TenantCanOverrideConditions = w.TenantCanOverrideConditions, CreatedAt = w.CreatedAt, CreatedByUserId = w.CreatedByUserId, UpdatedAt = w.UpdatedAt, UpdatedByUserId = w.UpdatedByUserId,
            Triggers = w.Triggers.Select(t => new AutomationTriggerDto { Id = t.Id, EventType = t.EventType, SourceModule = t.SourceModule }).ToList(),
            Conditions = w.Conditions.Select(c => new AutomationConditionDto { Id = c.Id, ExpressionType = c.ExpressionType.ToString(), Expression = c.Expression, Order = c.Order }).ToList(),
            Actions = w.Actions.Select(a => new AutomationActionDto { Id = a.Id, ActionType = a.ActionType.ToString(), Order = a.Order, ConfigJson = a.ConfigJson, IsCritical = a.IsCritical }).ToList()
        }).ToList();

        return Result.Success(dtos);
    }
}

public class GetGlobalTemplateByIdQueryHandler : IRequestHandler<GetGlobalTemplateByIdQuery, Result<AutomationWorkflowDto>>
{
    private readonly IAutomationWorkflowRepository _repository;

    public GetGlobalTemplateByIdQueryHandler(IAutomationWorkflowRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<AutomationWorkflowDto>> Handle(GetGlobalTemplateByIdQuery request, CancellationToken cancellationToken)
    {
        var workflow = await _repository.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        if (workflow == null || workflow.TenantId != null || !workflow.IsTemplate)
            return Result.Failure<AutomationWorkflowDto>("NotFound", "Template not found");

        return Result.Success(new AutomationWorkflowDto
        {
            Id = workflow.Id, TenantId = workflow.TenantId, Name = workflow.Name, Description = workflow.Description, ScopeType = workflow.ScopeType.ToString(), IsTemplate = workflow.IsTemplate, IsEnabled = workflow.IsEnabled, Severity = workflow.Severity.ToString(), IsEnforced = workflow.IsEnforced, TenantCanDisable = workflow.TenantCanDisable, TenantCanOverrideConditions = workflow.TenantCanOverrideConditions, CreatedAt = workflow.CreatedAt, CreatedByUserId = workflow.CreatedByUserId, UpdatedAt = workflow.UpdatedAt, UpdatedByUserId = workflow.UpdatedByUserId,
            Triggers = workflow.Triggers.Select(t => new AutomationTriggerDto { Id = t.Id, EventType = t.EventType, SourceModule = t.SourceModule }).ToList(),
            Conditions = workflow.Conditions.Select(c => new AutomationConditionDto { Id = c.Id, ExpressionType = c.ExpressionType.ToString(), Expression = c.Expression, Order = c.Order }).ToList(),
            Actions = workflow.Actions.Select(a => new AutomationActionDto { Id = a.Id, ActionType = a.ActionType.ToString(), Order = a.Order, ConfigJson = a.ConfigJson, IsCritical = a.IsCritical }).ToList()
        });
    }
}

public class GetExecutionsQueryHandler : IRequestHandler<GetExecutionsQuery, Result<PaginatedResultDto<AutomationExecutionDto>>>
{
    private readonly IAutomationExecutionRepository _repository;

    public GetExecutionsQueryHandler(IAutomationExecutionRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<PaginatedResultDto<AutomationExecutionDto>>> Handle(GetExecutionsQuery request, CancellationToken cancellationToken)
    {
        ExecutionStatus? status = null;
        if (!string.IsNullOrEmpty(request.Status) && Enum.TryParse<ExecutionStatus>(request.Status, true, out var s))
            status = s;

        var executions = await _repository.GetByTenantIdAsync(request.TenantId, request.WorkflowId, status, request.From, request.To, request.Page, request.PageSize, cancellationToken);
        var totalCount = await _repository.GetCountByTenantIdAsync(request.TenantId, request.WorkflowId, status, request.From, request.To, cancellationToken);

        var dtos = executions.Select(e => new AutomationExecutionDto
        {
            Id = e.Id, WorkflowId = e.WorkflowId, WorkflowName = e.WorkflowName, TenantId = e.TenantId, EventType = e.EventType, EventId = e.EventId, StartedAt = e.StartedAt, CompletedAt = e.CompletedAt, Status = e.Status.ToString(), ErrorMessage = e.ErrorMessage, ActionsExecutedCount = e.ActionsExecutedCount, ActionsFailedCount = e.ActionsFailedCount, PayloadSnapshot = e.PayloadSnapshot, DurationMs = e.CompletedAt.HasValue ? (long)(e.CompletedAt.Value - e.StartedAt).TotalMilliseconds : null
        }).ToList();

        return Result.Success(new PaginatedResultDto<AutomationExecutionDto>
        {
            Items = dtos,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        });
    }
}

public class GetExecutionByIdQueryHandler : IRequestHandler<GetExecutionByIdQuery, Result<AutomationExecutionDto>>
{
    private readonly IAutomationExecutionRepository _repository;

    public GetExecutionByIdQueryHandler(IAutomationExecutionRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<AutomationExecutionDto>> Handle(GetExecutionByIdQuery request, CancellationToken cancellationToken)
    {
        var execution = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (execution == null || execution.TenantId != request.TenantId)
            return Result.Failure<AutomationExecutionDto>("NotFound", "Execution not found");

        var durationMs = execution.CompletedAt.HasValue
            ? (long)(execution.CompletedAt.Value - execution.StartedAt).TotalMilliseconds
            : (long?)null;

        return Result.Success(new AutomationExecutionDto
        {
            Id = execution.Id, WorkflowId = execution.WorkflowId, WorkflowName = execution.WorkflowName, TenantId = execution.TenantId, EventType = execution.EventType, EventId = execution.EventId, StartedAt = execution.StartedAt, CompletedAt = execution.CompletedAt, Status = execution.Status.ToString(), ErrorMessage = execution.ErrorMessage, ActionsExecutedCount = execution.ActionsExecutedCount, ActionsFailedCount = execution.ActionsFailedCount, PayloadSnapshot = execution.PayloadSnapshot, DurationMs = durationMs
        });
    }
}

public class GetAvailableEventTypesQueryHandler : IRequestHandler<GetAvailableEventTypesQuery, Result<EventTypesCatalogDto>>
{
    public Task<Result<EventTypesCatalogDto>> Handle(GetAvailableEventTypesQuery request, CancellationToken cancellationToken)
    {
        var catalog = new EventTypesCatalogDto
        {
            AllEventTypes = AutomationEventTypes.GetAllEventTypes().ToList(),
            EventTypesByCategory = AutomationEventTypes.GetEventTypesByCategory()
                .ToDictionary(x => x.Key, x => x.Value.ToList())
        };

        return Task.FromResult(Result.Success(catalog));
    }
}

public class GetAvailableActionTypesQueryHandler : IRequestHandler<GetAvailableActionTypesQuery, Result<List<ActionTypeCatalogDto>>>
{
    public Task<Result<List<ActionTypeCatalogDto>>> Handle(GetAvailableActionTypesQuery request, CancellationToken cancellationToken)
    {
        var actions = new List<ActionTypeCatalogDto>
        {
            // Internal actions
            new()
            {
                Name = "RevokeSessions",
                Category = "Internal",
                Description = "Revokes all active sessions for the target user",
                ConfigSchema = new List<ActionConfigSchemaDto>
                {
                    new() { Name = "userId", Type = "guid", Required = false, Description = "Target user ID (defaults to event user)" }
                }
            },
            new()
            {
                Name = "RequireMfaNextSignIn",
                Category = "Internal",
                Description = "Requires the user to complete MFA on their next sign-in",
                ConfigSchema = new List<ActionConfigSchemaDto>
                {
                    new() { Name = "userId", Type = "guid", Required = false, Description = "Target user ID (defaults to event user)" }
                }
            },
            new()
            {
                Name = "LockUserAccount",
                Category = "Internal",
                Description = "Locks the user account preventing any sign-ins",
                ConfigSchema = new List<ActionConfigSchemaDto>
                {
                    new() { Name = "userId", Type = "guid", Required = false, Description = "Target user ID (defaults to event user)" }
                }
            },
            new()
            {
                Name = "DisableAppAccess",
                Category = "Internal",
                Description = "Disables access to a specific application for the user",
                ConfigSchema = new List<ActionConfigSchemaDto>
                {
                    new() { Name = "userId", Type = "guid", Required = false, Description = "Target user ID (defaults to event user)" },
                    new() { Name = "appId", Type = "guid", Required = false, Description = "Target application ID (defaults to event app)" }
                }
            },
            new()
            {
                Name = "TriggerAccessReview",
                Category = "Internal",
                Description = "Creates an access review for the specified target",
                ConfigSchema = new List<ActionConfigSchemaDto>
                {
                    new() { Name = "targetType", Type = "string", Required = false, Description = "Type of target (App, User, Group)" },
                    new() { Name = "targetId", Type = "string", Required = false, Description = "Target resource ID" }
                }
            },

            // Notification actions
            new()
            {
                Name = "SendEmail",
                Category = "Notification",
                Description = "Sends an email notification to specified recipients",
                ConfigSchema = new List<ActionConfigSchemaDto>
                {
                    new() { Name = "recipients", Type = "string[]", Required = false, Description = "Email addresses (defaults to event user email)" },
                    new() { Name = "subject", Type = "string", Required = false, Description = "Email subject" },
                    new() { Name = "body", Type = "string", Required = false, Description = "Email body (supports {{placeholders}})" },
                    new() { Name = "templateId", Type = "string", Required = false, Description = "Email template ID to use" }
                }
            },
            new()
            {
                Name = "SendToChannel",
                Category = "Notification",
                Description = "Sends a message to Slack, Teams, or other channel",
                ConfigSchema = new List<ActionConfigSchemaDto>
                {
                    new() { Name = "channelType", Type = "string", Required = false, Description = "Channel type (Slack, Teams)" },
                    new() { Name = "webhookUrl", Type = "string", Required = true, Description = "Webhook URL for the channel" },
                    new() { Name = "message", Type = "string", Required = false, Description = "Message to send (supports {{placeholders}})" }
                }
            },

            // Extensibility actions
            new()
            {
                Name = "InvokeWebhook",
                Category = "Extensibility",
                Description = "Invokes an external webhook with event data",
                ConfigSchema = new List<ActionConfigSchemaDto>
                {
                    new() { Name = "url", Type = "string", Required = true, Description = "Webhook URL to invoke" }
                }
            },
            new()
            {
                Name = "PushEventToQueue",
                Category = "Extensibility",
                Description = "Pushes event data to a message queue for async processing",
                ConfigSchema = new List<ActionConfigSchemaDto>
                {
                    new() { Name = "topic", Type = "string", Required = false, Description = "Queue topic name (default: automation-events)" }
                }
            }
        };

        return Task.FromResult(Result.Success(actions));
    }
}
