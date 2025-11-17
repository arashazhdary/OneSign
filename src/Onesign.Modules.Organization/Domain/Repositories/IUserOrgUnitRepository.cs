using Onesign.Modules.Organization.Domain.Entities;

namespace Onesign.Modules.Organization.Domain.Repositories;

public interface IUserOrgUnitRepository
{
    Task<List<UserOrgUnit>> GetByTenantUserIdAsync(Guid tenantUserId, CancellationToken cancellationToken = default);
    Task<UserOrgUnit?> GetPrimaryByTenantUserIdAsync(Guid tenantUserId, CancellationToken cancellationToken = default);
    Task<List<UserOrgUnit>> GetByOrgUnitIdAsync(Guid orgUnitId, CancellationToken cancellationToken = default);
    Task<List<UserOrgUnit>> GetByOrgUnitAndDescendantsAsync(Guid orgUnitId, List<Guid> descendantIds, CancellationToken cancellationToken = default);
    Task AddAsync(UserOrgUnit userOrgUnit, CancellationToken cancellationToken = default);
    Task AddRangeAsync(List<UserOrgUnit> userOrgUnits, CancellationToken cancellationToken = default);
    Task DeleteByTenantUserIdAsync(Guid tenantUserId, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid tenantUserId, Guid orgUnitId, CancellationToken cancellationToken = default);
}

