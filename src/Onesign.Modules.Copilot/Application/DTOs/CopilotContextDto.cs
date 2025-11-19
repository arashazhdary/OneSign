using Onesign.Modules.Copilot.Domain.Enums;

namespace Onesign.Modules.Copilot.Application.DTOs;

public class CopilotContextDto
{
    public ContextType Type { get; set; }
    public Dictionary<string, object?> Data { get; set; } = new();
}

public class DashboardContextData
{
    public int TotalUsers { get; set; }
    public int TotalApplications { get; set; }
    public int ActiveIncidents { get; set; }
    public int PendingChangeSets { get; set; }
    public int RiskyUsers { get; set; }
    public int RiskyApplications { get; set; }
    public List<TopRiskDto> TopRisks { get; set; } = new();
    public List<RecentActivityDto> RecentActivities { get; set; } = new();
}

public class TopRiskDto
{
    public string RiskType { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public Guid EntityId { get; set; }
    public string EntityName { get; set; } = string.Empty;
    public int RiskScore { get; set; }
    public string Description { get; set; } = string.Empty;
}

public class RecentActivityDto
{
    public string ActivityType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTimeOffset Timestamp { get; set; }
}

public class IncidentContextData
{
    public Guid IncidentId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<IncidentEventDto> Events { get; set; } = new();
    public List<IncidentEntityDto> Entities { get; set; } = new();
    public List<PlaybookDto> AvailablePlaybooks { get; set; } = new();
}

public class IncidentEventDto
{
    public Guid EventId { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTimeOffset Timestamp { get; set; }
}

public class IncidentEntityDto
{
    public string EntityType { get; set; } = string.Empty;
    public Guid EntityId { get; set; }
    public string EntityName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}

public class PlaybookDto
{
    public Guid PlaybookId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class PolicyContextData
{
    public Guid PolicyId { get; set; }
    public string PolicyName { get; set; } = string.Empty;
    public string PolicyType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<PolicyRuleDto> Rules { get; set; } = new();
    public int MatchCount { get; set; }
    public List<PolicyMatchDto> RecentMatches { get; set; } = new();
}

public class PolicyRuleDto
{
    public string RuleName { get; set; } = string.Empty;
    public string Condition { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
}

public class PolicyMatchDto
{
    public Guid MatchId { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public Guid EntityId { get; set; }
    public string EntityName { get; set; } = string.Empty;
    public DateTimeOffset MatchedAt { get; set; }
}

public class ChangeSetContextData
{
    public Guid ChangeSetId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<ChangeItemDto> Items { get; set; } = new();
    public SimulationSummaryDto? SimulationSummary { get; set; }
}

public class ChangeItemDto
{
    public Guid ItemId { get; set; }
    public string ChangeType { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public Guid EntityId { get; set; }
    public string EntityName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class SimulationSummaryDto
{
    public int AffectedUsers { get; set; }
    public int AffectedApplications { get; set; }
    public int AffectedPolicies { get; set; }
    public List<string> Warnings { get; set; } = new();
    public List<string> Recommendations { get; set; } = new();
}

public class HuntingContextData
{
    public List<SavedQueryDto> SavedQueries { get; set; } = new();
    public List<ScheduledHuntDto> ScheduledHunts { get; set; } = new();
    public HuntResultsDto? CurrentResults { get; set; }
}

public class SavedQueryDto
{
    public Guid QueryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Query { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class ScheduledHuntDto
{
    public Guid HuntId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Schedule { get; set; } = string.Empty;
    public DateTimeOffset? LastRun { get; set; }
    public int LastResultCount { get; set; }
}

public class HuntResultsDto
{
    public Guid QueryId { get; set; }
    public string QueryName { get; set; } = string.Empty;
    public int TotalResults { get; set; }
    public List<HuntResultItemDto> Items { get; set; } = new();
}

public class HuntResultItemDto
{
    public Dictionary<string, object?> Data { get; set; } = new();
}

public class AutomationContextData
{
    public List<WorkflowSummaryDto> Workflows { get; set; } = new();
    public List<RecentExecutionDto> RecentExecutions { get; set; } = new();
}

public class WorkflowSummaryDto
{
    public Guid WorkflowId { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsEnabled { get; set; }
    public string Severity { get; set; } = string.Empty;
    public int TriggerCount { get; set; }
    public int ActionCount { get; set; }
}

public class RecentExecutionDto
{
    public Guid ExecutionId { get; set; }
    public string WorkflowName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset ExecutedAt { get; set; }
}

public class ConversationHistoryDto
{
    public Guid ConversationId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset LastMessageAt { get; set; }
    public List<ConversationMessageDto> Messages { get; set; } = new();
}

public class ConversationMessageDto
{
    public Guid MessageId { get; set; }
    public string Role { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string ContextType { get; set; } = string.Empty;
    public Guid? ContextId { get; set; }
    public List<SuggestedActionDto> SuggestedActions { get; set; } = new();
    public DateTimeOffset CreatedAt { get; set; }
}

public class ActionExecutionResultDto
{
    public bool Success { get; set; }
    public string? ResultUrl { get; set; }
    public Guid? CreatedEntityId { get; set; }
    public string? Message { get; set; }
}
