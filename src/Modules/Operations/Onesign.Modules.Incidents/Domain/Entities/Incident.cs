using Onesign.Modules.Incidents.Domain.Enums;

namespace Onesign.Modules.Incidents.Domain.Entities;

public class Incident
{
    public Incident()
    {
    }

    public Incident(Guid id, Guid tenantId, string title, string description, IncidentSeverity severity, string source)
    {
        Id = id;
        TenantId = tenantId;
        Title = title;
        Description = description;
        Severity = severity;
        Status = IncidentStatus.Open;
        DetectedAt = DateTime.UtcNow;
        CreatedAt = DateTime.UtcNow;
    }

    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public IncidentCategory Category { get; set; }
    public IncidentSeverity Severity { get; set; }
    public IncidentStatus Status { get; set; }
    public DetectionSource DetectionSource { get; set; }
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
    public List<IncidentComment> Comments { get; set; } = new();

    // Methods
    public void Assign(Guid assigneeId)
    {
        AssignedTo = assigneeId;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Resolve(Guid userId, string resolution, string? rootCause = null)
    {
        Status = IncidentStatus.Resolved;
        ResolvedAt = DateTime.UtcNow;
        ResolvedByUserId = userId;
        ResolutionSummary = resolution;
        RootCause = rootCause;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Close(Guid userId, string? notes = null)
    {
        Status = IncidentStatus.Closed;
        ClosedAt = DateTime.UtcNow;
        ClosedByUserId = userId;
        ClosingNotes = notes;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Escalate(Guid userId, string reason)
    {
        IsEscalated = true;
        EscalationReason = reason;
        UpdatedAt = DateTime.UtcNow;
    }

    public void AddComment(Guid userId, string text)
    {
        Comments.Add(new IncidentComment
        {
            Id = Guid.NewGuid(),
            IncidentId = Id,
            UserId = userId,
            Text = text,
            CreatedAt = DateTime.UtcNow
        });
        UpdatedAt = DateTime.UtcNow;
    }
}
