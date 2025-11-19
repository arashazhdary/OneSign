using MediatR;
using Onesign.Modules.Incidents.Application.DTOs;
using Onesign.Modules.Incidents.Domain.Enums;

namespace Onesign.Modules.Incidents.Application.Commands;

public class UpdateIncidentStatusCommand : IRequest<IncidentDto?>
{
    public Guid Id { get; set; }
    public IncidentStatus Status { get; set; }
    public Guid UpdatedByUserId { get; set; }
    public string? Note { get; set; }
}
