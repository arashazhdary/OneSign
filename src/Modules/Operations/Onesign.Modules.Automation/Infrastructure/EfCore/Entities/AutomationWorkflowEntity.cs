namespace Onesign.Modules.Automation.Infrastructure.EfCore.Entities;

public class AutomationWorkflowEntity
{
    public Guid Id { get; set; }
    public Guid? TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int ScopeType { get; set; }
    public bool IsTemplate { get; set; }
    public bool IsEnabled { get; set; }
    public int Severity { get; set; }
    public bool IsEnforced { get; set; }
    public bool TenantCanDisable { get; set; }
    public bool TenantCanOverrideConditions { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public Guid CreatedByUserId { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
    public Guid? UpdatedByUserId { get; set; }

    public ICollection<AutomationTriggerEntity> Triggers { get; set; } = new List<AutomationTriggerEntity>();
    public ICollection<AutomationConditionEntity> Conditions { get; set; } = new List<AutomationConditionEntity>();
    public ICollection<AutomationActionEntity> Actions { get; set; } = new List<AutomationActionEntity>();
}
