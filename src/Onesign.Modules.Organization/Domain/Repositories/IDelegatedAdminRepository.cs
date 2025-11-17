using Onesign.Modules.Organization.Domain.Entities;

namespace Onesign.Modules.Organization.Domain.Repositories;

public interface IDelegatedAdminRepository
{
    Task<DelegatedAdminScope?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<DelegatedAdminScope>> GetByTenantUserIdAsync(Guid tenantUserId, CancellationToken cancellationToken = default);
    Task<List<DelegatedAdminScope>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<DelegatedAdminScope> AddAsync(DelegatedAdminScope delegatedAdminScope, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(Guid tenantUserId, Guid orgUnitId, CancellationToken cancellationToken = default);
}

