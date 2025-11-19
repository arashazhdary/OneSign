using Onesign.Modules.Authorization.Domain.Enums;

namespace Onesign.Modules.Authorization.Infrastructure.EfCore.Entities;

public class PolicyConditionEntity
{
    public Guid Id { get; set; }
    public Guid ConditionGroupId { get; set; }
    public AttributeSourceType SourceType { get; set; }
    public string SourceKey { get; set; } = string.Empty;
    public ConditionOperator Operator { get; set; }
    public string Value { get; set; } = string.Empty;

    public PolicyConditionGroupEntity? ConditionGroup { get; set; }
}
