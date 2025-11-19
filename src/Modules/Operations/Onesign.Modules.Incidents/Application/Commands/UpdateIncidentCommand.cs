using MediatR;
using Onesign.Modules.Incidents.Application.DTOs;
using Onesign.Modules.Incidents.Domain.Enums;

namespace Onesign.Modules.Incidents.Application.Commands;

public class UpdateIncidentCommand : IRequest<IncidentDto?>
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public IncidentCategory Category { get; set; }
    public IncidentSeverity Severity { get; set; }
    public int AffectedUsersCount { get; set; }
    public int AffectedAppsCount { get; set; }
    public Guid UpdatedByUserId { get; set; }
}
