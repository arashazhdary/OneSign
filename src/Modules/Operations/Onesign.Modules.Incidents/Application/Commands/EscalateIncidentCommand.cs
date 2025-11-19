using MediatR;

namespace Onesign.Modules.Incidents.Application.Commands;

public class EscalateIncidentCommand : IRequest<bool>
{
    public Guid TenantId { get; set; }
    public Guid IncidentId { get; set; }
    public Guid EscalatedBy { get; set; }
    public Guid EscalateTo { get; set; }
    public string Reason { get; set; } = string.Empty;
}
