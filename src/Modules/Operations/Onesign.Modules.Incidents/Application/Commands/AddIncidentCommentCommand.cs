using MediatR;
using Onesign.Modules.Incidents.Application.DTOs;

namespace Onesign.Modules.Incidents.Application.Commands;

public class AddIncidentCommentCommand : IRequest<bool>
{
    public Guid TenantId { get; set; }
    public Guid IncidentId { get; set; }
    public Guid AuthorId { get; set; }
    public string Content { get; set; } = string.Empty;
}
