using MediatR;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Copilot.Application.Commands;
using Onesign.Modules.Copilot.Application.DTOs;
using Onesign.Modules.Copilot.Application.Services;
using Onesign.Modules.Copilot.Domain.Enums;
using Onesign.Shared.Result;

namespace Onesign.Modules.Copilot.Application.Handlers;

public class SendCopilotQueryCommandHandler : IRequestHandler<SendCopilotQueryCommand, Result<CopilotQueryResponse>>
{
    private readonly ICopilotOrchestrator _orchestrator;
    private readonly ILogger<SendCopilotQueryCommandHandler> _logger;

    public SendCopilotQueryCommandHandler(
        ICopilotOrchestrator orchestrator,
        ILogger<SendCopilotQueryCommandHandler> logger)
    {
        _orchestrator = orchestrator;
        _logger = logger;
    }

    public async Task<Result<CopilotQueryResponse>> Handle(SendCopilotQueryCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Handling SendCopilotQueryCommand for tenant {TenantId}, user {UserId}",
            request.TenantId, request.UserId);

        var queryRequest = new CopilotQueryRequest
        {
            TenantId = request.TenantId,
            UserId = request.UserId,
            ConversationId = request.ConversationId,
            ContextType = request.ContextType,
            ContextId = request.ContextId,
            Message = request.Message,
            Locale = request.Locale
        };

        return await _orchestrator.ProcessQueryAsync(queryRequest, cancellationToken);
    }
}

public class CreateAutomationDraftCommandHandler : IRequestHandler<CreateAutomationDraftCommand, Result<ActionExecutionResultDto>>
{
    private readonly ICopilotActionExecutor _actionExecutor;
    private readonly ILogger<CreateAutomationDraftCommandHandler> _logger;

    public CreateAutomationDraftCommandHandler(
        ICopilotActionExecutor actionExecutor,
        ILogger<CreateAutomationDraftCommandHandler> logger)
    {
        _actionExecutor = actionExecutor;
        _logger = logger;
    }

    public async Task<Result<ActionExecutionResultDto>> Handle(CreateAutomationDraftCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Handling CreateAutomationDraftCommand for tenant {TenantId}, user {UserId}",
            request.TenantId, request.UserId);

        var parameters = new Dictionary<string, string>
        {
            ["name"] = request.Name,
            ["description"] = request.Description ?? "",
            ["triggerEventType"] = request.TriggerEventType,
            ["actionType"] = request.ActionType,
            ["actionConfigJson"] = request.ActionConfigJson ?? ""
        };

        if (!string.IsNullOrEmpty(request.ConditionExpression))
        {
            parameters["conditionExpression"] = request.ConditionExpression;
        }

        return await _actionExecutor.ExecuteActionAsync(
            request.TenantId,
            request.UserId,
            SuggestedActionType.CreateAutomationDraft,
            parameters,
            cancellationToken);
    }
}

public class CreateHuntDraftCommandHandler : IRequestHandler<CreateHuntDraftCommand, Result<ActionExecutionResultDto>>
{
    private readonly ICopilotActionExecutor _actionExecutor;
    private readonly ILogger<CreateHuntDraftCommandHandler> _logger;

    public CreateHuntDraftCommandHandler(
        ICopilotActionExecutor actionExecutor,
        ILogger<CreateHuntDraftCommandHandler> logger)
    {
        _actionExecutor = actionExecutor;
        _logger = logger;
    }

    public async Task<Result<ActionExecutionResultDto>> Handle(CreateHuntDraftCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Handling CreateHuntDraftCommand for tenant {TenantId}, user {UserId}",
            request.TenantId, request.UserId);

        var parameters = new Dictionary<string, string>
        {
            ["name"] = request.Name,
            ["description"] = request.Description ?? "",
            ["query"] = request.Query,
            ["createSchedule"] = request.CreateScheduledHunt.ToString().ToLowerInvariant()
        };

        if (!string.IsNullOrEmpty(request.Schedule))
        {
            parameters["schedule"] = request.Schedule;
        }

        return await _actionExecutor.ExecuteActionAsync(
            request.TenantId,
            request.UserId,
            SuggestedActionType.CreateHuntDraft,
            parameters,
            cancellationToken);
    }
}
