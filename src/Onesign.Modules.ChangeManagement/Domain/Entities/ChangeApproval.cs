using Onesign.Modules.ChangeManagement.Domain.Enums;

namespace Onesign.Modules.ChangeManagement.Domain.Entities;

public class ChangeApproval
{
    public Guid Id { get; set; }
    public Guid ChangeSetId { get; set; }
    public Guid ApproverUserId { get; set; }
    public ApprovalDecision Decision { get; set; }
    public string? Reason { get; set; }
    public DateTimeOffset DecidedAt { get; set; }
}
