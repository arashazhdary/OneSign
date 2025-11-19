namespace Onesign.Modules.Automation.Infrastructure.EfCore.Entities;

public class AutomationConditionEntity
{
    public Guid Id { get; set; }
    public Guid WorkflowId { get; set; }
    public int ExpressionType { get; set; }
    public string Expression { get; set; } = string.Empty;
    public int Order { get; set; }

    public AutomationWorkflowEntity Workflow { get; set; } = null!;
}
