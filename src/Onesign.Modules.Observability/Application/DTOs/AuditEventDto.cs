using Onesign.Modules.Observability.Domain.Enums;

namespace Onesign.Modules.Observability.Application.DTOs;

public class AuditEventDto
{
    public Guid Id { get; set; }
    public Guid? TenantId { get; set; }
    public string CorrelationId { get; set; } = string.Empty;
    public AuditCategory Category { get; set; }
    public AuditSeverity Severity { get; set; }

    public string ActorId { get; set; } = string.Empty;
    public string ActorDisplayName { get; set; } = string.Empty;
    public string ActorType { get; set; } = string.Empty;

    public string Action { get; set; } = string.Empty;
    public string TargetType { get; set; } = string.Empty;
    public string TargetId { get; set; } = string.Empty;

    public string IpAddress { get; set; } = string.Empty;
    public string UserAgent { get; set; } = string.Empty;
    public string? Country { get; set; }

    public DateTime OccurredAt { get; set; }
    public string DataJson { get; set; } = string.Empty;
}
