namespace Onesign.Modules.Automation.Application.DTOs;

public class AutomationWorkflowDto
{
    public Guid Id { get; set; }
    public Guid? TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string ScopeType { get; set; } = "Tenant";
    public bool IsTemplate { get; set; }
    public bool IsEnabled { get; set; }
    public string Severity { get; set; } = "Info";
    public bool IsEnforced { get; set; }
    public bool TenantCanDisable { get; set; }
    public bool TenantCanOverrideConditions { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public Guid CreatedByUserId { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
    public Guid? UpdatedByUserId { get; set; }

    public List<AutomationTriggerDto> Triggers { get; set; } = new();
    public List<AutomationConditionDto> Conditions { get; set; } = new();
    public List<AutomationActionDto> Actions { get; set; } = new();
}

public class AutomationTriggerDto
{
    public Guid Id { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string SourceModule { get; set; } = string.Empty;
}

public class AutomationConditionDto
{
    public Guid Id { get; set; }
    public string ExpressionType { get; set; } = "JsonLogic";
    public string Expression { get; set; } = string.Empty;
    public int Order { get; set; }
}

public class AutomationActionDto
{
    public Guid Id { get; set; }
    public string ActionType { get; set; } = string.Empty;
    public int Order { get; set; }
    public string ConfigJson { get; set; } = "{}";
    public bool IsCritical { get; set; }
}

public class AutomationExecutionDto
{
    public Guid Id { get; set; }
    public Guid WorkflowId { get; set; }
    public string? WorkflowName { get; set; }
    public Guid TenantId { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string? EventId { get; set; }
    public DateTimeOffset StartedAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public string Status { get; set; } = "Pending";
    public string? ErrorMessage { get; set; }
    public int ActionsExecutedCount { get; set; }
    public int ActionsFailedCount { get; set; }
    public string PayloadSnapshot { get; set; } = "{}";
    public long? DurationMs { get; set; }
    public List<ActionExecutionLogDto> ActionLogs { get; set; } = new();
}

public class ActionExecutionLogDto
{
    public string ActionType { get; set; } = string.Empty;
    public int Order { get; set; }
    public bool IsCritical { get; set; }
    public DateTimeOffset StartedAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public string Status { get; set; } = "Pending";
    public string? ErrorMessage { get; set; }
    public string? ResultData { get; set; }
}

public class WorkflowTestResultDto
{
    public bool Matched { get; set; }
    public List<string> MatchedTriggers { get; set; } = new();
    public bool ConditionsPassed { get; set; }
    public List<ActionTestResultDto> ActionsToExecute { get; set; } = new();
}

public class ActionTestResultDto
{
    public string ActionType { get; set; } = string.Empty;
    public int Order { get; set; }
    public bool IsCritical { get; set; }
}

public class PaginatedResultDto<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}
