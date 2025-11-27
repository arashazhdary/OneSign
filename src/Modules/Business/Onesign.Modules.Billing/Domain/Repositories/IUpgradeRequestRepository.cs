using Onesign.Modules.Billing.Domain.Entities;
using Onesign.Modules.Billing.Domain.Enums;

namespace Onesign.Modules.Billing.Domain.Repositories;

public interface IUpgradeRequestRepository
{
    Task<UpgradeRequest?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<UpgradeRequest>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<List<UpgradeRequest>> GetByStatusAsync(UpgradeRequestStatus status, CancellationToken cancellationToken = default);
    Task<UpgradeRequest> AddAsync(UpgradeRequest upgradeRequest, CancellationToken cancellationToken = default);
    Task UpdateAsync(UpgradeRequest upgradeRequest, CancellationToken cancellationToken = default);
}
