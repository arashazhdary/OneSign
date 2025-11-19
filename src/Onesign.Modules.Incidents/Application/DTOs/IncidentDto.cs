using Onesign.Modules.Incidents.Domain.Enums;

namespace Onesign.Modules.Incidents.Application.DTOs;

public class IncidentDto
{
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
}

public class IncidentListDto
{
    public List<IncidentDto> Incidents { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}
