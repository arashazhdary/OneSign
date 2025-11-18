using Onesign.Modules.MultiRegion.Domain.Entities;

namespace Onesign.Modules.MultiRegion.Domain.Repositories;

public interface ITenantDataResidencyRepository
{
    Task<TenantDataResidency?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<TenantDataResidency?> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TenantDataResidency>> GetByRegionIdAsync(string regionId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TenantDataResidency>> GetByComplianceTagAsync(string complianceTag, CancellationToken cancellationToken = default);
    Task AddAsync(TenantDataResidency residency, CancellationToken cancellationToken = default);
    Task UpdateAsync(TenantDataResidency residency, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
