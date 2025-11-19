using Onesign.Modules.Authorization.Domain.Enums;

namespace Onesign.Modules.Authorization.Domain.Entities;

public class PolicyCondition
{
    public Guid Id { get; set; }
    public Guid ConditionGroupId { get; set; }
    public AttributeSourceType SourceType { get; set; }
    public string SourceKey { get; set; } = string.Empty;
    public ConditionOperator Operator { get; set; }
    public string Value { get; set; } = string.Empty;

    public PolicyConditionGroup? ConditionGroup { get; set; }
}
