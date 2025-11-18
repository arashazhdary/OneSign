namespace Onesign.Modules.IdentityLifecycle.Infrastructure.EfCore.Entities;

public class LifecycleEventEntity
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid HRRecordId { get; set; }
    public int EventType { get; set; }
    public string OldSnapshotJson { get; set; } = "{}";
    public string NewSnapshotJson { get; set; } = "{}";
    public int Status { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ProcessedAt { get; set; }

    public HRIdentityRecordEntity? HRRecord { get; set; }
}
