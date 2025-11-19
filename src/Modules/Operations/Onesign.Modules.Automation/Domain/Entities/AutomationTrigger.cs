namespace Onesign.Modules.Automation.Domain.Entities;

public class AutomationTrigger
{
    public Guid Id { get; set; }
    public Guid WorkflowId { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string SourceModule { get; set; } = string.Empty;
}
