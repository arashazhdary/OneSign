using MediatR;
using Onesign.Modules.Incidents.Application.DTOs;

namespace Onesign.Modules.Incidents.Application.Commands;

public class AssignIncidentCommand : IRequest<IncidentDto?>
{
    public Guid Id { get; set; }
    public Guid AssignToUserId { get; set; }
    public Guid AssignedByUserId { get; set; }
    public string? Note { get; set; }
}
