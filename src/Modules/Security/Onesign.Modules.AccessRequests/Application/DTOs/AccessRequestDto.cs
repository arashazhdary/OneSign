namespace Onesign.Modules.AccessRequests.Application.DTOs;

public class AccessRequestDto
{
    public Guid Id { get; set; }
    public Guid RequesterId { get; set; }
    public string RequesterName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Justification { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public List<AccessRequestItemDto> Items { get; set; } = new();
    public List<ApprovalStepDto> ApprovalSteps { get; set; } = new();
}

public class AccessRequestItemDto
{
    public Guid Id { get; set; }
    public string AccessType { get; set; } = string.Empty;
    public Guid TargetId { get; set; }
    public string TargetName { get; set; } = string.Empty;
    public int? DurationMinutes { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class ApprovalStepDto
{
    public Guid Id { get; set; }
    public int StepNumber { get; set; }
    public Guid ApproverId { get; set; }
    public string ApproverName { get; set; } = string.Empty;
    public string? Action { get; set; }
    public string? Comment { get; set; }
    public DateTime? ActionAt { get; set; }
}
