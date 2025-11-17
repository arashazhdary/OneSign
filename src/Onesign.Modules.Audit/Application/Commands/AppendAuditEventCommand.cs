using MediatR;
using Onesign.Modules.Audit.Application.DTOs;
using Onesign.Modules.Audit.Domain.Enums;
using Onesign.Shared.Result;

namespace Onesign.Modules.Audit.Application.Commands;

public class AppendAuditEventCommand : IRequest<Result<AuditEventDto>>
{
    public Guid? TenantId { get; set; }
    public Guid? ActorId { get; set; }
    public AuditEventType EventType { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? Metadata { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
}

