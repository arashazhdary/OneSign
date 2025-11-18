using Onesign.Modules.Authorization.Domain.Enums;

namespace Onesign.Modules.Authorization.Domain.Entities;

public class PolicyConditionGroup
{
    public Guid Id { get; set; }
    public Guid PolicyDefinitionId { get; set; }
    public ConditionLogicalOperator LogicalOperator { get; set; }

    public PolicyDefinition? PolicyDefinition { get; set; }
    public ICollection<PolicyCondition> Conditions { get; set; } = new List<PolicyCondition>();
}
