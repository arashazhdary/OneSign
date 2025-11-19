namespace Onesign.Modules.Incidents.Infrastructure.EfCore.Entities;

public class IncidentEntity
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Category { get; set; }
    public int Severity { get; set; }
    public int Status { get; set; }
    public int DetectionSource { get; set; }
    public Guid? PrimaryUserId { get; set; }
    public Guid? PrimaryAppId { get; set; }
    public int AffectedUsersCount { get; set; }
    public int AffectedAppsCount { get; set; }
    public DateTime DetectedAt { get; set; }
    public DateTime? AcknowledgedAt { get; set; }
    public Guid? AcknowledgedByUserId { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public Guid? ResolvedByUserId { get; set; }
    public DateTime? ClosedAt { get; set; }
    public Guid? ClosedByUserId { get; set; }
    public string? ResolutionSummary { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Additional properties
    public Guid? AssignedTo { get; set; }
    public bool IsEscalated { get; set; }
    public string? EscalationReason { get; set; }
    public string? RootCause { get; set; }
    public string? ClosingNotes { get; set; }
}
