using Onesign.Modules.Observability.Domain.Entities;
using Onesign.Modules.Observability.Domain.Enums;

namespace Onesign.Modules.Observability.Domain.Services;

public interface IAuditWriter
{
    Task WriteAsync(
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
        CancellationToken cancellationToken = default);

    Task WriteAsync(AuditEvent auditEvent, CancellationToken cancellationToken = default);
}
