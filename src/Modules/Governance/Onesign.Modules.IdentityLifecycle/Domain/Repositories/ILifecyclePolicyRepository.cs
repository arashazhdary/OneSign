using Onesign.Modules.IdentityLifecycle.Domain.Entities;

namespace Onesign.Modules.IdentityLifecycle.Domain.Repositories;

public interface ILifecyclePolicyRepository
{
    Task<LifecyclePolicy?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<LifecyclePolicy>> GetByTenantAsync(Guid tenantId, CancellationToken ct = default);
    Task<IReadOnlyList<LifecyclePolicy>> GetMatchingPoliciesAsync(Guid tenantId, string? orgUnitCode, string? jobRole, CancellationToken ct = default);
    Task AddAsync(LifecyclePolicy policy, CancellationToken ct = default);
    Task UpdateAsync(LifecyclePolicy policy, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
