using Onesign.Modules.IdentityInsights.Domain.Entities;

namespace Onesign.Modules.IdentityInsights.Domain.Repositories;

public interface ITenantRiskProfileRepository
{
    Task<TenantRiskProfile?> GetByTenantIdAsync(Guid tenantId, CancellationToken ct = default);
    Task<IReadOnlyList<TenantRiskProfile>> GetHighRiskTenantsAsync(int minRiskScore, CancellationToken ct = default);
    Task AddAsync(TenantRiskProfile profile, CancellationToken ct = default);
    Task UpdateAsync(TenantRiskProfile profile, CancellationToken ct = default);
}
