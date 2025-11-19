using Onesign.Modules.Organization.Domain.Services;

namespace Onesign.Modules.Organization.Domain.Services;

public interface IOrgAuthorizationService
{
    Task<bool> CanManageUserAsync(Guid currentTenantUserId, Guid targetTenantUserId, CancellationToken cancellationToken = default);
    Task<bool> CanManageApplicationAsync(Guid currentTenantUserId, Guid applicationClientId, CancellationToken cancellationToken = default);
    Task<bool> CanViewOrgUnitAsync(Guid currentTenantUserId, Guid orgUnitId, CancellationToken cancellationToken = default);
    Task<bool> CanManageOrgUnitAsync(Guid currentTenantUserId, Guid orgUnitId, CancellationToken cancellationToken = default);
    Task<OrgScope> GetEffectiveScopeAsync(Guid currentTenantUserId, CancellationToken cancellationToken = default);
}

