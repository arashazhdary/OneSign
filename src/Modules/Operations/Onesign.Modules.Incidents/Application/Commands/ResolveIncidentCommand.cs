using MediatR;
using Onesign.Modules.Incidents.Application.DTOs;

namespace Onesign.Modules.Incidents.Application.Commands;

public class ResolveIncidentCommand : IRequest<IncidentDto?>
{
    public Guid Id { get; set; }
    public Guid ResolvedByUserId { get; set; }
    public string ResolutionSummary { get; set; } = string.Empty;
}
