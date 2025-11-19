using Onesign.Modules.Automation.Domain.Enums;

namespace Onesign.Modules.Automation.Domain.Entities;

public class AutomationWorkflow
{
    public Guid Id { get; set; }
    public Guid? TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public WorkflowScopeType ScopeType { get; set; }
    public bool IsTemplate { get; set; }
    public bool IsEnabled { get; set; }
    public WorkflowSeverity Severity { get; set; }
    public bool IsEnforced { get; set; }
    public bool TenantCanDisable { get; set; }
    public bool TenantCanOverrideConditions { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public Guid CreatedByUserId { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
    public Guid? UpdatedByUserId { get; set; }

    public List<AutomationTrigger> Triggers { get; set; } = new();
    public List<AutomationCondition> Conditions { get; set; } = new();
    public List<AutomationAction> Actions { get; set; } = new();
}
