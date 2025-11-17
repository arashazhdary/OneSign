namespace Onesign.Modules.Authorization.Domain.Entities;

public class PolicyAssignment
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid PolicyDefinitionId { get; set; }
    public Guid PolicyTargetId { get; set; }
    public int Order { get; set; }
    public DateTime CreatedAt { get; set; }

    public PolicyDefinition? PolicyDefinition { get; set; }
    public PolicyTarget? PolicyTarget { get; set; }
}
