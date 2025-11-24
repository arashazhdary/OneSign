using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.Copilot.Application.Commands;
using Onesign.Modules.Copilot.Application.DTOs;
using Onesign.Modules.Copilot.Application.Queries;
using Onesign.Modules.Copilot.Domain.Enums;

namespace Onesign.Api.Controllers.Tenant;

/// <summary>
/// Controller for Copilot AI assistant functionality at tenant level
/// </summary>
[Route("api/tenant/copilot")]
[Authorize(Policy = "TenantUser")]
public class CopilotController : TenantControllerBase
{
    private readonly IMediator _mediator;

    public CopilotController(IMediator mediator) => _mediator = mediator;

    /// <summary>
    /// Send a query to the Copilot AI assistant
    /// </summary>
    /// <param name="request">The query request containing message and context</param>
    /// <returns>The AI-generated response with suggested actions</returns>
    [HttpPost("query")]
    [ProducesResponseType(typeof(CopilotQueryResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<CopilotQueryResponse>> Query([FromBody] CopilotQueryApiRequest request)
    {
        var tenantId = GetCurrentTenantId();
        var userId = GetCurrentUserId();

        if (tenantId == Guid.Empty)
        {
            // Fallback for development/testing
            tenantId = request.TenantId ?? Guid.Empty;
        }

        if (userId == Guid.Empty)
        {
            userId = request.UserId ?? Guid.Empty;
        }

        if (!Enum.TryParse<ContextType>(request.ContextType, true, out var contextType))
        {
            contextType = ContextType.Generic;
        }

        var command = new SendCopilotQueryCommand
        {
            TenantId = tenantId,
            UserId = userId,
            ConversationId = request.ConversationId,
            ContextType = contextType,
            ContextId = request.ContextId,
            Message = request.Message,
            Locale = request.Locale ?? "en"
        };

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
        {
            return BadRequest(new { error = result.ErrorMessage });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Get recent conversation history for the current user
    /// </summary>
    /// <param name="limit">Maximum number of conversations to return (default: 10)</param>
    /// <param name="tenantId">Optional tenant ID filter</param>
    /// <param name="userId">Optional user ID filter</param>
    /// <returns>List of recent conversations</returns>
    [HttpGet("conversations")]
    [ProducesResponseType(typeof(List<ConversationHistoryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<List<ConversationHistoryDto>>> GetConversations(
        [FromQuery] int limit = 10,
        [FromQuery] Guid? tenantId = null,
        [FromQuery] Guid? userId = null)
    {
        var resolvedTenantId = GetCurrentTenantId();
        var resolvedUserId = GetCurrentUserId();

        if (resolvedTenantId == Guid.Empty && tenantId.HasValue)
        {
            resolvedTenantId = tenantId.Value;
        }

        if (resolvedUserId == Guid.Empty && userId.HasValue)
        {
            resolvedUserId = userId.Value;
        }

        var query = new GetRecentConversationsQuery
        {
            TenantId = resolvedTenantId,
            UserId = resolvedUserId,
            Limit = Math.Min(limit, 50)
        };

        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
        {
            return BadRequest(new { error = result.ErrorMessage });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Get a specific conversation with full message history
    /// </summary>
    /// <param name="id">The conversation ID</param>
    /// <param name="id">Conversation ID</param>
    /// <param name="tenantId">Optional tenant ID filter</param>
    /// <param name="userId">Optional user ID filter</param>
    /// <returns>The conversation with all messages</returns>
    [HttpGet("conversations/{id:guid}")]
    [ProducesResponseType(typeof(ConversationHistoryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ConversationHistoryDto>> GetConversation(
        Guid id,
        [FromQuery] Guid? tenantId = null,
        [FromQuery] Guid? userId = null)
    {
        var resolvedTenantId = GetCurrentTenantId();
        var resolvedUserId = GetCurrentUserId();

        if (resolvedTenantId == Guid.Empty && tenantId.HasValue)
        {
            resolvedTenantId = tenantId.Value;
        }

        if (resolvedUserId == Guid.Empty && userId.HasValue)
        {
            resolvedUserId = userId.Value;
        }

        var query = new GetConversationHistoryQuery
        {
            TenantId = resolvedTenantId,
            UserId = resolvedUserId,
            ConversationId = id
        };

        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
        {
            if (result.ErrorCode == "NotFound")
            {
                return NotFound(new { error = result.ErrorMessage });
            }
            return BadRequest(new { error = result.ErrorMessage });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Execute a suggested action from a Copilot response
    /// </summary>
    /// <param name="request">The action execution request</param>
    /// <returns>Result of the action execution</returns>
    [HttpPost("actions/execute")]
    [ProducesResponseType(typeof(ActionExecutionResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ActionExecutionResultDto>> ExecuteAction([FromBody] ExecuteActionRequest request)
    {
        var tenantId = GetCurrentTenantId();
        var userId = GetCurrentUserId();

        if (tenantId == Guid.Empty)
        {
            tenantId = request.TenantId ?? Guid.Empty;
        }

        if (userId == Guid.Empty)
        {
            userId = request.UserId ?? Guid.Empty;
        }

        if (!Enum.TryParse<SuggestedActionType>(request.ActionType, true, out var actionType))
        {
            return BadRequest(new { error = "Invalid action type" });
        }

        // Route to appropriate command based on action type
        switch (actionType)
        {
            case SuggestedActionType.CreateAutomationDraft:
                var automationCommand = new CreateAutomationDraftCommand
                {
                    TenantId = tenantId,
                    UserId = userId,
                    Name = request.Parameters.GetValueOrDefault("name", "New Automation"),
                    Description = request.Parameters.GetValueOrDefault("description", ""),
                    TriggerEventType = request.Parameters.GetValueOrDefault("triggerEventType", ""),
                    ActionType = request.Parameters.GetValueOrDefault("actionType", ""),
                    ActionConfigJson = request.Parameters.GetValueOrDefault("actionConfigJson", "{}"),
                    ConditionExpression = request.Parameters.TryGetValue("conditionExpression", out var conditionExpr) ? conditionExpr : null
                };
                var automationResult = await _mediator.Send(automationCommand);
                if (!automationResult.IsSuccess)
                {
                    return BadRequest(new { error = automationResult.ErrorMessage });
                }
                return Ok(automationResult.Value);

            case SuggestedActionType.CreateHuntDraft:
                var huntCommand = new CreateHuntDraftCommand
                {
                    TenantId = tenantId,
                    UserId = userId,
                    Name = request.Parameters.GetValueOrDefault("name", "New Hunt Query"),
                    Query = request.Parameters.GetValueOrDefault("query", ""),
                    Description = request.Parameters.GetValueOrDefault("description", "")
                };
                var huntResult = await _mediator.Send(huntCommand);
                if (!huntResult.IsSuccess)
                {
                    return BadRequest(new { error = huntResult.ErrorMessage });
                }
                return Ok(huntResult.Value);

            default:
                // For navigation actions, return the URL/parameters for client-side handling
                return Ok(new ActionExecutionResultDto
                {
                    Success = true,
                    ResultUrl = BuildActionUrl(actionType, request.Parameters),
                    Message = $"Navigate to {actionType}"
                });
        }
    }

    private string? BuildActionUrl(SuggestedActionType actionType, Dictionary<string, string> parameters)
    {
        return actionType switch
        {
            SuggestedActionType.OpenIncident => parameters.TryGetValue("incidentId", out var incidentId)
                ? $"/incidents/{incidentId}"
                : null,
            SuggestedActionType.OpenUser => parameters.TryGetValue("userId", out var uid)
                ? $"/users/{uid}"
                : null,
            SuggestedActionType.OpenApp => parameters.TryGetValue("appId", out var appId)
                ? $"/applications/{appId}"
                : null,
            SuggestedActionType.OpenChangeSet => parameters.TryGetValue("changeSetId", out var csId)
                ? $"/change-management/{csId}"
                : null,
            SuggestedActionType.OpenHunt => parameters.TryGetValue("queryId", out var qId)
                ? $"/hunting/{qId}"
                : null,
            _ => null
        };
    }
}

/// <summary>
/// API request model for Copilot queries
/// </summary>
public class CopilotQueryApiRequest
{
    /// <summary>
    /// Context type: Dashboard, Incident, Policy, ChangeSet, Hunting, Automation, Generic
    /// </summary>
    public string ContextType { get; set; } = "Generic";

    /// <summary>
    /// Optional context ID (e.g., incident ID, policy ID)
    /// </summary>
    public Guid? ContextId { get; set; }

    /// <summary>
    /// The user's question or message
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Locale for response: en, fa
    /// </summary>
    public string? Locale { get; set; } = "en";

    /// <summary>
    /// Optional existing conversation ID to continue
    /// </summary>
    public Guid? ConversationId { get; set; }

    /// <summary>
    /// Tenant ID (optional, extracted from JWT in production)
    /// </summary>
    public Guid? TenantId { get; set; }

    /// <summary>
    /// User ID (optional, extracted from JWT in production)
    /// </summary>
    public Guid? UserId { get; set; }
}

/// <summary>
/// Request model for executing suggested actions
/// </summary>
public class ExecuteActionRequest
{
    /// <summary>
    /// The type of action to execute
    /// </summary>
    public string ActionType { get; set; } = string.Empty;

    /// <summary>
    /// Action-specific parameters
    /// </summary>
    public Dictionary<string, string> Parameters { get; set; } = new();

    /// <summary>
    /// Tenant ID (optional, extracted from JWT in production)
    /// </summary>
    public Guid? TenantId { get; set; }

    /// <summary>
    /// User ID (optional, extracted from JWT in production)
    /// </summary>
    public Guid? UserId { get; set; }
}
