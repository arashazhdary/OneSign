using Onesign.Modules.Observability.Domain.Entities;
using Onesign.Modules.Observability.Domain.Enums;
using Onesign.Modules.Observability.Domain.Repositories;
using Onesign.Modules.Observability.Domain.Services;

namespace Onesign.Modules.Observability.Application.Services;

public class AuditWriter : IAuditWriter
{
    private readonly IAuditEventRepository _auditEventRepository;

    public AuditWriter(IAuditEventRepository auditEventRepository)
    {
        _auditEventRepository = auditEventRepository;
    }

    public async Task WriteAsync(
        Guid? tenantId,
        AuditCategory category,
        AuditSeverity severity,
        string action,
        string actorId,
        string actorDisplayName,
        string actorType,
        string targetType,
        string targetId,
        string ipAddress,
        string userAgent,
        string? dataJson = null,
        CancellationToken cancellationToken = default)
    {
        var auditEvent = new AuditEvent
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            CorrelationId = Guid.NewGuid().ToString(),
            Category = category,
            Severity = severity,
            ActorId = actorId,
            ActorDisplayName = actorDisplayName,
            ActorType = actorType,
            Action = action,
            TargetType = targetType,
            TargetId = targetId,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            OccurredAt = DateTime.UtcNow,
            DataJson = dataJson ?? "{}"
        };

        await _auditEventRepository.AddAsync(auditEvent, cancellationToken);
    }

    public async Task WriteAsync(AuditEvent auditEvent, CancellationToken cancellationToken = default)
    {
        await _auditEventRepository.AddAsync(auditEvent, cancellationToken);
    }
}
