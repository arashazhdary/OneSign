namespace Onesign.Modules.ChangeManagement.Application.DTOs;

public class ChangeApprovalDto
{
    public Guid Id { get; set; }
    public Guid ChangeSetId { get; set; }
    public Guid ApproverUserId { get; set; }
    public string Decision { get; set; } = string.Empty;
    public string? Reason { get; set; }
    public DateTimeOffset DecidedAt { get; set; }
}
