namespace Onesign.Modules.AccessRequests.Application.DTOs;

public class ApprovalDecisionDto
{
    public Guid StepId { get; set; }
    public Guid ApproverId { get; set; }
    public string ApproverName { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string? Comment { get; set; }
    public DateTime ActionAt { get; set; }
}

public class ApproveAccessRequestStepRequest
{
    public string? Comment { get; set; }
}

public class RejectAccessRequestStepRequest
{
    public string? Comment { get; set; }
}

public class EscalateAccessRequestStepRequest
{
    public Guid NewApproverId { get; set; }
    public string NewApproverName { get; set; } = string.Empty;
    public string? Reason { get; set; }
}
