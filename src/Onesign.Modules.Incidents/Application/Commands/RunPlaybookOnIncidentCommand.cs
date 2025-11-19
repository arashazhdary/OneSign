using MediatR;
using Onesign.Modules.Incidents.Application.DTOs;

namespace Onesign.Modules.Incidents.Application.Commands;

public class RunPlaybookOnIncidentCommand : IRequest<IncidentPlaybookRunDto?>
{
    public Guid IncidentId { get; set; }
    public Guid WorkflowId { get; set; }
    public string WorkflowName { get; set; } = string.Empty;
    public Guid TriggeredByUserId { get; set; }
    public Dictionary<string, string> Parameters { get; set; } = new();
}
