using Onesign.Modules.IdentityLifecycle.Domain.Enums;

namespace Onesign.Modules.IdentityLifecycle.Domain.Entities;

public class LifecycleEvent
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid HRRecordId { get; set; }
    public LifecycleEventType EventType { get; set; }
    public string OldSnapshotJson { get; set; } = "{}";
    public string NewSnapshotJson { get; set; } = "{}";
    public ProcessingStatus Status { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ProcessedAt { get; set; }

    public HRIdentityRecord? HRRecord { get; set; }
}
