namespace Onesign.Modules.AccessRequests.Application.DTOs;

public class AccessApprovalFlowDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? AccessType { get; set; }
    public string? TargetApplication { get; set; }
    public List<ApprovalFlowStepDto> Steps { get; set; } = new();
    public bool RequireAllApprovals { get; set; }
    public bool IsEnabled { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class ApprovalFlowStepDto
{
    public int StepNumber { get; set; }
    public string ApproverType { get; set; } = string.Empty;
    public Guid? ApproverId { get; set; }
    public string? ApproverRole { get; set; }
    public bool IsRequired { get; set; }
    public int TimeoutHours { get; set; }
}

public class CreateAccessApprovalFlowRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? AccessType { get; set; }
    public string? TargetApplication { get; set; }
    public List<ApprovalFlowStepDto> Steps { get; set; } = new();
    public bool RequireAllApprovals { get; set; } = true;
    public bool IsEnabled { get; set; } = true;
}

public class UpdateAccessApprovalFlowRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public List<ApprovalFlowStepDto>? Steps { get; set; }
    public bool? RequireAllApprovals { get; set; }
    public bool? IsEnabled { get; set; }
}
