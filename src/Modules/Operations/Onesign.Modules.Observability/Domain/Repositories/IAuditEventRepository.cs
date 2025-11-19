using Onesign.Modules.Observability.Domain.Entities;
using Onesign.Modules.Observability.Domain.Enums;

namespace Onesign.Modules.Observability.Domain.Repositories;

public interface IAuditEventRepository
{
    Task<AuditEvent?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<AuditEvent>> SearchAsync(
        Guid? tenantId,
        DateTime? from,
        DateTime? to,
        AuditCategory? category,
        AuditSeverity? severity,
        string? actorId,
        string? action,
        int skip,
        int take,
        CancellationToken cancellationToken = default);
    Task<int> CountAsync(
        Guid? tenantId,
        DateTime? from,
        DateTime? to,
        AuditCategory? category,
        AuditSeverity? severity,
        string? actorId,
        string? action,
        CancellationToken cancellationToken = default);
    Task<AuditEvent> AddAsync(AuditEvent auditEvent, CancellationToken cancellationToken = default);
}
