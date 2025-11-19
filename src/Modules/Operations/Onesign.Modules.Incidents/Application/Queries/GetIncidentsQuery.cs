using MediatR;
using Onesign.Modules.Incidents.Application.DTOs;
using Onesign.Modules.Incidents.Domain.Enums;

namespace Onesign.Modules.Incidents.Application.Queries;

public class GetIncidentsQuery : IRequest<IncidentListDto>
{
    public Guid TenantId { get; set; }
    public IncidentStatus? Status { get; set; }
    public IncidentSeverity? Severity { get; set; }
    public IncidentCategory? Category { get; set; }
    public DetectionSource? DetectionSource { get; set; }
    public Guid? PrimaryUserId { get; set; }
    public Guid? PrimaryAppId { get; set; }
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
    public string? SearchTerm { get; set; }
    public string SortBy { get; set; } = "DetectedAt";
    public bool SortDescending { get; set; } = true;
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
