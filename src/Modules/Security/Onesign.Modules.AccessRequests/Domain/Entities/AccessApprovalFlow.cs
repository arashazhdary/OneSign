namespace Onesign.Modules.AccessRequests.Domain.Entities;

public class AccessApprovalFlow
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? AccessType { get; set; }
    public string? TargetApplication { get; set; }
    public string StepsJson { get; set; } = "[]";
    public bool RequireAllApprovals { get; set; } = true;
    public bool IsEnabled { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class ApprovalFlowStep
{
    public int StepNumber { get; set; }
    public string ApproverType { get; set; } = string.Empty; // "user", "role", "manager", "resource_owner"
    public Guid? ApproverId { get; set; }
    public string? ApproverRole { get; set; }
    public bool IsRequired { get; set; } = true;
    public int TimeoutHours { get; set; } = 24;
}
