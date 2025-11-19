namespace Onesign.Modules.Automation.Infrastructure.EfCore.Entities;

public class AutomationTriggerEntity
{
    public Guid Id { get; set; }
    public Guid WorkflowId { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string SourceModule { get; set; } = string.Empty;

    public AutomationWorkflowEntity Workflow { get; set; } = null!;
}
