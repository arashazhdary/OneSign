using Onesign.Modules.Authorization.Domain.Enums;

namespace Onesign.Modules.Authorization.Application.DTOs;

public class PolicyDefinitionDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public PolicyEffect Effect { get; set; }
    public int Priority { get; set; }
    public bool Enabled { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<PolicyConditionGroupDto> ConditionGroups { get; set; } = new();
}

public class PolicyConditionGroupDto
{
    public Guid Id { get; set; }
    public ConditionLogicalOperator LogicalOperator { get; set; }
    public List<PolicyConditionDto> Conditions { get; set; } = new();
}

public class PolicyConditionDto
{
    public Guid Id { get; set; }
    public AttributeSourceType SourceType { get; set; }
    public string SourceKey { get; set; } = string.Empty;
    public ConditionOperator Operator { get; set; }
    public string Value { get; set; } = string.Empty;
}
