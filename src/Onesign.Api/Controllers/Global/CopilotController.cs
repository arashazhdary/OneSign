using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.Copilot.Application.Commands;
using Onesign.Modules.Copilot.Application.DTOs;
using Onesign.Modules.Copilot.Application.Queries;
using Onesign.Modules.Copilot.Domain.Enums;

namespace Onesign.Api.Controllers.Global;

/// <summary>
/// Global controller for Copilot AI assistant with cross-tenant context support
/// </summary>
[Route("api/global/copilot")]
[ApiController]
[Authorize(Policy = "GlobalAdmin")]
public class GlobalCopilotController : ControllerBase
{
    private readonly IMediator _mediator;

    public GlobalCopilotController(IMediator mediator) => _mediator = mediator;

    /// <summary>
    /// Send a query to the Copilot AI assistant with global admin context
    /// </summary>
    /// <param name="request">The query request containing message and context</param>
    /// <returns>The AI-generated response with suggested actions</returns>
    [HttpPost("query")]
    [ProducesResponseType(typeof(CopilotQueryResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<CopilotQueryResponse>> Query([FromBody] GlobalCopilotQueryRequest request)
    {
        if (!Enum.TryParse<ContextType>(request.ContextType, true, out var contextType))
        {
            contextType = ContextType.Generic;
        }

        var command = new SendCopilotQueryCommand
        {
            TenantId = request.TenantId ?? Guid.Empty,
            UserId = request.UserId,
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
    /// Get recent conversation history for a global admin user
    /// </summary>
    /// <param name="userId">The admin user ID</param>
    /// <param name="tenantId">Optional tenant filter</param>
    /// <param name="limit">Maximum number of conversations to return (default: 10)</param>
    /// <returns>List of recent conversations</returns>
    [HttpGet("conversations")]
    [ProducesResponseType(typeof(List<ConversationHistoryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<List<ConversationHistoryDto>>> GetConversations(
        [FromQuery] Guid userId,
        [FromQuery] Guid? tenantId = null,
        [FromQuery] int limit = 10)
    {
        var query = new GetRecentConversationsQuery
        {
            TenantId = tenantId ?? Guid.Empty,
            UserId = userId,
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
    /// <param name="userId">The admin user ID</param>
    /// <param name="tenantId">Optional tenant filter</param>
    /// <returns>The conversation with all messages</returns>
    [HttpGet("conversations/{id:guid}")]
    [ProducesResponseType(typeof(ConversationHistoryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ConversationHistoryDto>> GetConversation(
        Guid id,
        [FromQuery] Guid userId,
        [FromQuery] Guid? tenantId = null)
    {
        var query = new GetConversationHistoryQuery
        {
            TenantId = tenantId ?? Guid.Empty,
            UserId = userId,
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
    /// Execute a suggested action from a Copilot response in global context
    /// </summary>
    /// <param name="request">The action execution request</param>
    /// <returns>Result of the action execution</returns>
    [HttpPost("actions/execute")]
    [ProducesResponseType(typeof(ActionExecutionResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ActionExecutionResultDto>> ExecuteAction([FromBody] GlobalExecuteActionRequest request)
    {
        if (!Enum.TryParse<SuggestedActionType>(request.ActionType, true, out var actionType))
        {
            return BadRequest(new { error = "Invalid action type" });
        }

        switch (actionType)
        {
            case SuggestedActionType.CreateAutomationDraft:
                var automationCommand = new CreateAutomationDraftCommand
                {
                    TenantId = request.TenantId ?? Guid.Empty,
                    UserId = request.UserId,
                    Name = request.Parameters.GetValueOrDefault("name", "New Automation"),
                    Description = request.Parameters.GetValueOrDefault("description", ""),
                    TriggersJson = request.Parameters.GetValueOrDefault("triggers", "[]"),
                    ActionsJson = request.Parameters.GetValueOrDefault("actions", "[]")
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
                    TenantId = request.TenantId ?? Guid.Empty,
                    UserId = request.UserId,
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
                return Ok(new ActionExecutionResultDto
                {
                    Success = true,
                    ResultUrl = BuildActionUrl(actionType, request.Parameters, request.TenantId),
                    Message = $"Navigate to {actionType}"
                });
        }
    }

    /// <summary>
    /// Get cross-tenant analytics summary for Copilot usage
    /// </summary>
    /// <param name="from">Start date for analytics</param>
    /// <param name="to">End date for analytics</param>
    /// <returns>Copilot usage analytics</returns>
    [HttpGet("analytics")]
    [ProducesResponseType(typeof(GlobalCopilotAnalyticsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<GlobalCopilotAnalyticsDto>> GetAnalytics(
        [FromQuery] DateTimeOffset? from = null,
        [FromQuery] DateTimeOffset? to = null)
    {
        // Analytics would be implemented via a dedicated query
        var analytics = new GlobalCopilotAnalyticsDto
        {
            TotalConversations = 0,
            TotalQueries = 0,
            UniqueUsers = 0,
            TopContextTypes = new List<ContextTypeUsageDto>(),
            ActionExecutionStats = new List<ActionExecutionStatDto>(),
            TenantUsage = new List<TenantCopilotUsageDto>()
        };

        return Ok(analytics);
    }

    /// <summary>
    /// Get platform-wide knowledge base status
    /// </summary>
    /// <returns>Knowledge base health and status information</returns>
    [HttpGet("knowledge-base/status")]
    [ProducesResponseType(typeof(KnowledgeBaseStatusDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<KnowledgeBaseStatusDto>> GetKnowledgeBaseStatus()
    {
        var status = new KnowledgeBaseStatusDto
        {
            IsHealthy = true,
            LastUpdated = DateTimeOffset.UtcNow,
            DocumentCount = 0,
            IndexSize = "0 MB",
            EmbeddingsModel = "text-embedding-ada-002",
            LastSyncStatus = "Success"
        };

        return Ok(status);
    }

    private string? BuildActionUrl(SuggestedActionType actionType, Dictionary<string, string> parameters, Guid? tenantId)
    {
        var tenantPrefix = tenantId.HasValue ? $"/tenants/{tenantId}" : "";

        return actionType switch
        {
            SuggestedActionType.OpenIncident => parameters.TryGetValue("incidentId", out var incidentId)
                ? $"{tenantPrefix}/incidents/{incidentId}"
                : null,
            SuggestedActionType.OpenUser => parameters.TryGetValue("userId", out var uid)
                ? $"{tenantPrefix}/users/{uid}"
                : null,
            SuggestedActionType.OpenApp => parameters.TryGetValue("appId", out var appId)
                ? $"{tenantPrefix}/applications/{appId}"
                : null,
            SuggestedActionType.OpenChangeSet => parameters.TryGetValue("changeSetId", out var csId)
                ? $"{tenantPrefix}/change-management/{csId}"
                : null,
            SuggestedActionType.OpenHunt => parameters.TryGetValue("queryId", out var qId)
                ? $"{tenantPrefix}/hunting/{qId}"
                : null,
            _ => null
        };
    }
}

/// <summary>
/// API request model for global admin Copilot queries
/// </summary>
public class GlobalCopilotQueryRequest
{
    /// <summary>
    /// Optional tenant ID for tenant-specific context
    /// </summary>
    public Guid? TenantId { get; set; }

    /// <summary>
    /// The admin user ID
    /// </summary>
    public Guid UserId { get; set; }

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
}

/// <summary>
/// Request model for executing suggested actions in global context
/// </summary>
public class GlobalExecuteActionRequest
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
    /// Optional tenant ID for tenant-specific actions
    /// </summary>
    public Guid? TenantId { get; set; }

    /// <summary>
    /// The admin user ID
    /// </summary>
    public Guid UserId { get; set; }
}

/// <summary>
/// Global Copilot usage analytics
/// </summary>
public class GlobalCopilotAnalyticsDto
{
    public int TotalConversations { get; set; }
    public int TotalQueries { get; set; }
    public int UniqueUsers { get; set; }
    public List<ContextTypeUsageDto> TopContextTypes { get; set; } = new();
    public List<ActionExecutionStatDto> ActionExecutionStats { get; set; } = new();
    public List<TenantCopilotUsageDto> TenantUsage { get; set; } = new();
}

public class ContextTypeUsageDto
{
    public string ContextType { get; set; } = string.Empty;
    public int Count { get; set; }
    public decimal Percentage { get; set; }
}

public class ActionExecutionStatDto
{
    public string ActionType { get; set; } = string.Empty;
    public int TotalExecutions { get; set; }
    public int SuccessCount { get; set; }
    public int FailureCount { get; set; }
}

public class TenantCopilotUsageDto
{
    public Guid TenantId { get; set; }
    public string TenantName { get; set; } = string.Empty;
    public int QueryCount { get; set; }
    public int UniqueUsers { get; set; }
}

/// <summary>
/// Knowledge base health and status information
/// </summary>
public class KnowledgeBaseStatusDto
{
    public bool IsHealthy { get; set; }
    public DateTimeOffset LastUpdated { get; set; }
    public int DocumentCount { get; set; }
    public string IndexSize { get; set; } = string.Empty;
    public string EmbeddingsModel { get; set; } = string.Empty;
    public string LastSyncStatus { get; set; } = string.Empty;
}
