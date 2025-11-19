using Onesign.Modules.Automation.Domain.Enums;

namespace Onesign.Modules.Automation.Domain.Entities;

public class AutomationAction
{
    public Guid Id { get; set; }
    public Guid WorkflowId { get; set; }
    public ActionType ActionType { get; set; }
    public int Order { get; set; }
    public string ConfigJson { get; set; } = "{}";
    public bool IsCritical { get; set; }
}
