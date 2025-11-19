using MediatR;
using Onesign.Modules.Automation.Application.DTOs;
using Onesign.Modules.Automation.Application.Queries;
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
            Id = e.Id, WorkflowId = e.WorkflowId, WorkflowName = e.WorkflowName, TenantId = e.TenantId, EventType = e.EventType, EventId = e.EventId, StartedAt = e.StartedAt, CompletedAt = e.CompletedAt, Status = e.Status.ToString(), ErrorMessage = e.ErrorMessage, ActionsExecutedCount = e.ActionsExecutedCount, ActionsFailedCount = e.ActionsFailedCount, PayloadSnapshot = e.PayloadSnapshot
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

        return Result.Success(new AutomationExecutionDto
        {
            Id = execution.Id, WorkflowId = execution.WorkflowId, WorkflowName = execution.WorkflowName, TenantId = execution.TenantId, EventType = execution.EventType, EventId = execution.EventId, StartedAt = execution.StartedAt, CompletedAt = execution.CompletedAt, Status = execution.Status.ToString(), ErrorMessage = execution.ErrorMessage, ActionsExecutedCount = execution.ActionsExecutedCount, ActionsFailedCount = execution.ActionsFailedCount, PayloadSnapshot = execution.PayloadSnapshot
        });
    }
}
