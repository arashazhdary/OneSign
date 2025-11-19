namespace Onesign.Modules.ChangeManagement.Infrastructure.EfCore.Entities;

public class ChangeSetEntity
{
    public Guid Id { get; set; }
    public string ScopeType { get; set; } = string.Empty;
    public Guid ScopeId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Category { get; set; }
    public int Status { get; set; }
    public Guid RequestedByUserId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
    public Guid? ApprovedByUserId { get; set; }
    public DateTimeOffset? ApprovedAt { get; set; }
    public DateTimeOffset? ScheduledFor { get; set; }
    public DateTimeOffset? AppliedAt { get; set; }
    public DateTimeOffset? RolledBackAt { get; set; }
    public string? RollbackReason { get; set; }
    public string? SimulationSummaryJson { get; set; }

    public ICollection<ChangeItemEntity> Items { get; set; } = new List<ChangeItemEntity>();
    public ICollection<ChangeApprovalEntity> Approvals { get; set; } = new List<ChangeApprovalEntity>();
    public ICollection<ChangeExecutionLogEntity> ExecutionLogs { get; set; } = new List<ChangeExecutionLogEntity>();
}
