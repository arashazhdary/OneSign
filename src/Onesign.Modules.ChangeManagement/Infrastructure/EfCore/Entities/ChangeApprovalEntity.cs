namespace Onesign.Modules.ChangeManagement.Infrastructure.EfCore.Entities;

public class ChangeApprovalEntity
{
    public Guid Id { get; set; }
    public Guid ChangeSetId { get; set; }
    public Guid ApproverUserId { get; set; }
    public int Decision { get; set; }
    public string? Reason { get; set; }
    public DateTimeOffset DecidedAt { get; set; }

    public ChangeSetEntity ChangeSet { get; set; } = null!;
}
