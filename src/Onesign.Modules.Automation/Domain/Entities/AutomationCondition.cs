using Onesign.Modules.Automation.Domain.Enums;

namespace Onesign.Modules.Automation.Domain.Entities;

public class AutomationCondition
{
    public Guid Id { get; set; }
    public Guid WorkflowId { get; set; }
    public ExpressionType ExpressionType { get; set; }
    public string Expression { get; set; } = string.Empty;
    public int Order { get; set; }
}
