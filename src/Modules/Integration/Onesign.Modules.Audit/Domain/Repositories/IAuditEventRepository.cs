using Onesign.Modules.Audit.Domain.Entities;

namespace Onesign.Modules.Audit.Domain.Repositories;

public interface IAuditEventRepository
{
    Task<AuditEvent> AddAsync(AuditEvent auditEvent, CancellationToken cancellationToken = default);
    Task<List<AuditEvent>> GetByTenantIdAsync(Guid tenantId, DateTime? fromDate = null, DateTime? toDate = null, CancellationToken cancellationToken = default);
}

