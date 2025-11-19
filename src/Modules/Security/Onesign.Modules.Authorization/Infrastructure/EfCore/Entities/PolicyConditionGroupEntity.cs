using Onesign.Modules.Authorization.Domain.Enums;

namespace Onesign.Modules.Authorization.Infrastructure.EfCore.Entities;

public class PolicyConditionGroupEntity
{
    public Guid Id { get; set; }
    public Guid PolicyDefinitionId { get; set; }
    public ConditionLogicalOperator LogicalOperator { get; set; }

    public PolicyDefinitionEntity? PolicyDefinition { get; set; }
    public ICollection<PolicyConditionEntity> Conditions { get; set; } = new List<PolicyConditionEntity>();
}
