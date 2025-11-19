namespace Onesign.Modules.IdentityLifecycle.Application.DTOs;

public class HRIdentityRecordDto
{
    public Guid Id { get; set; }
    public string ExternalEmployeeId { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string OrgUnitCode { get; set; } = string.Empty;
    public string JobRole { get; set; } = string.Empty;
    public string? ManagerEmployeeId { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public DateTime LastSyncedAt { get; set; }
}

public class LifecycleEventDto
{
    public Guid Id { get; set; }
    public Guid HRRecordId { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string OldSnapshotJson { get; set; } = "{}";
    public string NewSnapshotJson { get; set; } = "{}";
    public string Status { get; set; } = string.Empty;
    public string? ErrorMessage { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ProcessedAt { get; set; }
}
