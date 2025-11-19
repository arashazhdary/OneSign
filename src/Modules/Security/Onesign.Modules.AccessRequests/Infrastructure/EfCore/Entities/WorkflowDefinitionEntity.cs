namespace Onesign.Modules.AccessRequests.Infrastructure.EfCore.Entities;

public class WorkflowDefinitionEntity
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int TargetType { get; set; }
    public Guid? TargetId { get; set; }
    public string ApprovalChainJson { get; set; } = "[]";
    public bool IsEnabled { get; set; }
    public DateTime CreatedAt { get; set; }
}
