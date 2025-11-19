namespace Onesign.Modules.Authorization.Infrastructure.EfCore.Entities;

public class PolicyAssignmentEntity
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid PolicyDefinitionId { get; set; }
    public Guid PolicyTargetId { get; set; }
    public int Order { get; set; }
    public DateTime CreatedAt { get; set; }

    public PolicyDefinitionEntity? PolicyDefinition { get; set; }
    public PolicyTargetEntity? PolicyTarget { get; set; }
}
