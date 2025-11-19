using MediatR;
using Onesign.Modules.Incidents.Application.DTOs;

namespace Onesign.Modules.Incidents.Application.Commands;

public class CloseIncidentCommand : IRequest<IncidentDto?>
{
    public Guid Id { get; set; }
    public Guid ClosedByUserId { get; set; }
    public string? FinalNote { get; set; }
}
