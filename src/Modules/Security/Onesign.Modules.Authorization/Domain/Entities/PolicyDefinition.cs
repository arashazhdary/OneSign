using Onesign.Modules.Authorization.Domain.Enums;

namespace Onesign.Modules.Authorization.Domain.Entities;

public class PolicyDefinition
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public PolicyEffect Effect { get; set; }
    public int Priority { get; set; }
    public bool Enabled { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public ICollection<PolicyConditionGroup> ConditionGroups { get; set; } = new List<PolicyConditionGroup>();
}
