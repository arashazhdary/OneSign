using Onesign.Modules.AccessRequests.Domain.Enums;

namespace Onesign.Modules.AccessRequests.Domain.Entities;

public class WorkflowDefinition
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public AccessType TargetType { get; set; }
    public Guid? TargetId { get; set; } // Specific role/app or null for all
    public string ApprovalChainJson { get; set; } = "[]"; // JSON array of approver role IDs or user IDs
    public bool IsEnabled { get; set; }
    public DateTime CreatedAt { get; set; }
}
