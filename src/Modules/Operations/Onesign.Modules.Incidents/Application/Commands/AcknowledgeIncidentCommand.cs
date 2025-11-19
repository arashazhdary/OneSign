using MediatR;
using Onesign.Modules.Incidents.Application.DTOs;

namespace Onesign.Modules.Incidents.Application.Commands;

public class AcknowledgeIncidentCommand : IRequest<IncidentDto?>
{
    public Guid Id { get; set; }
    public Guid AcknowledgedByUserId { get; set; }
    public string? Note { get; set; }
}
