using Onesign.Modules.Security.Domain.Entities;
using Onesign.Modules.Security.Domain.Enums;

namespace Onesign.Modules.Security.Domain.Repositories;

public interface IRiskEventRepository
{
    Task<RiskEvent?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<RiskEvent>> GetByTenantIdAsync(
        Guid tenantId,
        DateTime? fromDate,
        DateTime? toDate,
        RiskLevel? riskLevel,
        RiskEventType? eventType,
        Guid? tenantUserId,
        CancellationToken cancellationToken = default);
    Task AddAsync(RiskEvent riskEvent, CancellationToken cancellationToken = default);
}
