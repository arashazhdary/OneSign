using MediatR;
using Onesign.Modules.Incidents.Application.DTOs;

namespace Onesign.Modules.Incidents.Application.Commands;

public class AddIncidentNoteCommand : IRequest<IncidentNoteDto?>
{
    public Guid IncidentId { get; set; }
    public string Content { get; set; } = string.Empty;
    public Guid CreatedByUserId { get; set; }
}
