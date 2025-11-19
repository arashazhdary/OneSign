using Onesign.Modules.Security.Domain.Entities;

namespace Onesign.Modules.Security.Domain.Repositories;

public interface ITrustedDeviceRepository
{
    Task<TrustedDevice?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<TrustedDevice>> GetByTenantUserIdAsync(Guid tenantUserId, CancellationToken cancellationToken = default);
    Task<List<TrustedDevice>> GetActiveByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<TrustedDevice?> GetByDeviceIdAsync(Guid tenantUserId, string deviceId, CancellationToken cancellationToken = default);
    Task AddAsync(TrustedDevice trustedDevice, CancellationToken cancellationToken = default);
    Task UpdateAsync(TrustedDevice trustedDevice, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
