using Onesign.Modules.Tenants.Domain.Entities;

namespace Onesign.Modules.Tenants.Domain.Repositories;

public interface ITenantConfigRepository
{
    Task<TenantConfig?> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<TenantConfig> AddAsync(TenantConfig config, CancellationToken cancellationToken = default);
    Task UpdateAsync(TenantConfig config, CancellationToken cancellationToken = default);
}

