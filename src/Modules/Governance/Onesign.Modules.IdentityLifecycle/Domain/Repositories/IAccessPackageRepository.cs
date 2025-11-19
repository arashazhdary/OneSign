using Onesign.Modules.IdentityLifecycle.Domain.Entities;

namespace Onesign.Modules.IdentityLifecycle.Domain.Repositories;

public interface IAccessPackageRepository
{
    Task<AccessPackage?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<AccessPackage>> GetByTenantAsync(Guid tenantId, CancellationToken ct = default);
    Task<IReadOnlyList<AccessPackage>> GetEnabledByTenantAsync(Guid tenantId, CancellationToken ct = default);
    Task AddAsync(AccessPackage package, CancellationToken ct = default);
    Task UpdateAsync(AccessPackage package, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
