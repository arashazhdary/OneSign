using Onesign.Modules.ChangeManagement.Domain.Enums;

namespace Onesign.Modules.ChangeManagement.Domain.Entities;

public class ChangeSet
{
    public Guid Id { get; set; }
    public string ScopeType { get; set; } = string.Empty;
    public Guid ScopeId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ChangeCategory Category { get; set; }
    public ChangeSetStatus Status { get; set; }
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

    public List<ChangeItem> Items { get; set; } = new();
    public List<ChangeApproval> Approvals { get; set; } = new();
    public List<ChangeExecutionLog> ExecutionLogs { get; set; } = new();
}
