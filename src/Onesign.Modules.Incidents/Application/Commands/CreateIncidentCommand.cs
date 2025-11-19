using MediatR;
using Onesign.Modules.Incidents.Application.DTOs;
using Onesign.Modules.Incidents.Domain.Enums;

namespace Onesign.Modules.Incidents.Application.Commands;

public class CreateIncidentCommand : IRequest<IncidentDto>
{
    public Guid TenantId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public IncidentCategory Category { get; set; }
    public IncidentSeverity Severity { get; set; }
    public DetectionSource DetectionSource { get; set; }
    public Guid? PrimaryUserId { get; set; }
    public Guid? PrimaryAppId { get; set; }
    public int AffectedUsersCount { get; set; }
    public int AffectedAppsCount { get; set; }
    public List<IncidentEventDto> InitialEvents { get; set; } = new();
    public List<IncidentEntityDto> RelatedEntities { get; set; } = new();
}
