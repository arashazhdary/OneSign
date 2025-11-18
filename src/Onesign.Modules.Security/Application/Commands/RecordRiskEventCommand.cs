using MediatR;

namespace Onesign.Modules.Security.Application.Commands;

public class RecordRiskEventCommand : IRequest<Unit>
{
    public Guid UserId { get; set; }
    public Guid TenantId { get; set; }
    public int EventType { get; set; }
    public int RiskLevel { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public string? Location { get; set; }
    public string? Details { get; set; }
}
