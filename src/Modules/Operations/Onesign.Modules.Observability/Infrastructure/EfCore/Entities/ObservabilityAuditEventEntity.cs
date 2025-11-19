using Onesign.Modules.Observability.Domain.Entities;
using Onesign.Modules.Observability.Domain.Enums;

namespace Onesign.Modules.Observability.Infrastructure.EfCore.Entities;

public class ObservabilityAuditEventEntity
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

    public AuditEvent ToDomain()
    {
        return new AuditEvent
        {
            Id = Id,
            TenantId = TenantId,
            CorrelationId = CorrelationId,
            Category = Category,
            Severity = Severity,
            ActorId = ActorId,
            ActorDisplayName = ActorDisplayName,
            ActorType = ActorType,
            Action = Action,
            TargetType = TargetType,
            TargetId = TargetId,
            IpAddress = IpAddress,
            UserAgent = UserAgent,
            Country = Country,
            OccurredAt = OccurredAt,
            DataJson = DataJson
        };
    }

    public static ObservabilityAuditEventEntity FromDomain(AuditEvent auditEvent)
    {
        return new ObservabilityAuditEventEntity
        {
            Id = auditEvent.Id,
            TenantId = auditEvent.TenantId,
            CorrelationId = auditEvent.CorrelationId,
            Category = auditEvent.Category,
            Severity = auditEvent.Severity,
            ActorId = auditEvent.ActorId,
            ActorDisplayName = auditEvent.ActorDisplayName,
            ActorType = auditEvent.ActorType,
            Action = auditEvent.Action,
            TargetType = auditEvent.TargetType,
            TargetId = auditEvent.TargetId,
            IpAddress = auditEvent.IpAddress,
            UserAgent = auditEvent.UserAgent,
            Country = auditEvent.Country,
            OccurredAt = auditEvent.OccurredAt,
            DataJson = auditEvent.DataJson
        };
    }
}
