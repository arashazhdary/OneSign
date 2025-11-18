using Onesign.Modules.Authorization.Domain.Enums;

namespace Onesign.Modules.Authorization.Infrastructure.EfCore.Entities;

public class PolicyDefinitionEntity
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

    public ICollection<PolicyConditionGroupEntity> ConditionGroups { get; set; } = new List<PolicyConditionGroupEntity>();
}
