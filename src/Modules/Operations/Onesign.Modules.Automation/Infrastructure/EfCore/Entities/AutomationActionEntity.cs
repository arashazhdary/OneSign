namespace Onesign.Modules.Automation.Infrastructure.EfCore.Entities;

public class AutomationActionEntity
{
    public Guid Id { get; set; }
    public Guid WorkflowId { get; set; }
    public int ActionType { get; set; }
    public int Order { get; set; }
    public string ConfigJson { get; set; } = "{}";
    public bool IsCritical { get; set; }

    public AutomationWorkflowEntity Workflow { get; set; } = null!;
}
