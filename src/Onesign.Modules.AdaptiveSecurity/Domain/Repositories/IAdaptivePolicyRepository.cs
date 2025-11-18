using Onesign.Modules.AdaptiveSecurity.Domain.Entities;

namespace Onesign.Modules.AdaptiveSecurity.Domain.Repositories;

public interface IAdaptivePolicyRepository
{
    Task<AdaptivePolicy?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<AdaptivePolicy?> GetByIdAsync(Guid tenantId, Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<AdaptivePolicy>> GetByTenantAsync(Guid tenantId, CancellationToken ct = default);
    Task<IReadOnlyList<AdaptivePolicy>> GetByTenantIdAsync(Guid tenantId, CancellationToken ct = default);
    Task<IReadOnlyList<AdaptivePolicy>> GetEnabledPoliciesAsync(Guid tenantId, CancellationToken ct = default);
    Task AddAsync(AdaptivePolicy policy, CancellationToken ct = default);
    Task UpdateAsync(AdaptivePolicy policy, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
