using Onesign.Modules.Automation.Domain.Enums;

namespace Onesign.Modules.Automation.Domain.Entities;

public class AutomationExecution
{
    public Guid Id { get; set; }
    public Guid WorkflowId { get; set; }
    public Guid TenantId { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string? EventId { get; set; }
    public DateTimeOffset StartedAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public ExecutionStatus Status { get; set; }
    public string? ErrorMessage { get; set; }
    public int ActionsExecutedCount { get; set; }
    public int ActionsFailedCount { get; set; }
    public string PayloadSnapshot { get; set; } = "{}";

    public string? WorkflowName { get; set; }
}
