using MediatR;
using Onesign.Modules.Incidents.Application.DTOs;
using Onesign.Modules.Incidents.Domain.Enums;

namespace Onesign.Modules.Incidents.Application.Commands;

public class LinkEntityToIncidentCommand : IRequest<IncidentEntityDto?>
{
    public Guid IncidentId { get; set; }
    public IncidentEntityType EntityType { get; set; }
    public string EntityId { get; set; } = string.Empty;
    public string EntityName { get; set; } = string.Empty;
    public IncidentEntityRole Role { get; set; }
}
