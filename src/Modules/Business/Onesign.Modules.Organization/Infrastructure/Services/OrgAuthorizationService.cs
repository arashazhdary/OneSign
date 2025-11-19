using Microsoft.Extensions.Logging;
using Onesign.Modules.Applications.Domain.Repositories;
using Onesign.Modules.Identity.Domain.Repositories;
using Onesign.Modules.Organization.Domain.Repositories;
using Onesign.Modules.Organization.Domain.Services;

namespace Onesign.Modules.Organization.Infrastructure.Services;

public class OrgAuthorizationService : IOrgAuthorizationService
{
    private readonly ITenantUserRepository _tenantUserRepository;
    private readonly IOrgUnitRepository _orgUnitRepository;
    private readonly IUserOrgUnitRepository _userOrgUnitRepository;
    private readonly IApplicationOrgUnitRepository _applicationOrgUnitRepository;
    private readonly IDelegatedAdminRepository _delegatedAdminRepository;
    private readonly IApplicationClientRepository _applicationClientRepository;
    private readonly ILogger<OrgAuthorizationService> _logger;

    public OrgAuthorizationService(
        ITenantUserRepository tenantUserRepository,
        IOrgUnitRepository orgUnitRepository,
        IUserOrgUnitRepository userOrgUnitRepository,
        IApplicationOrgUnitRepository applicationOrgUnitRepository,
        IDelegatedAdminRepository delegatedAdminRepository,
        IApplicationClientRepository applicationClientRepository,
        ILogger<OrgAuthorizationService> logger)
    {
        _tenantUserRepository = tenantUserRepository;
        _orgUnitRepository = orgUnitRepository;
        _userOrgUnitRepository = userOrgUnitRepository;
        _applicationOrgUnitRepository = applicationOrgUnitRepository;
        _delegatedAdminRepository = delegatedAdminRepository;
        _applicationClientRepository = applicationClientRepository;
        _logger = logger;
    }

    public async Task<bool> CanManageUserAsync(Guid currentTenantUserId, Guid targetTenantUserId, CancellationToken cancellationToken = default)
    {
        var scope = await GetEffectiveScopeAsync(currentTenantUserId, cancellationToken);
        
        if (scope.IsGlobalAdmin)
        {
            return true;
        }

        // Check if target user is in scope
        var targetUserOrgUnits = await _userOrgUnitRepository.GetByTenantUserIdAsync(targetTenantUserId, cancellationToken);
        var targetOrgUnitIds = targetUserOrgUnits.Select(u => u.OrgUnitId).ToList();

        return targetOrgUnitIds.Any(id => scope.AllowedOrgUnitIds.Contains(id));
    }

    public async Task<bool> CanManageApplicationAsync(Guid currentTenantUserId, Guid applicationClientId, CancellationToken cancellationToken = default)
    {
        var scope = await GetEffectiveScopeAsync(currentTenantUserId, cancellationToken);
        
        if (scope.IsGlobalAdmin)
        {
            return true;
        }

        // Check if application is in scope
        var applicationOrgUnits = await _applicationOrgUnitRepository.GetByApplicationClientIdAsync(applicationClientId, cancellationToken);
        var applicationOrgUnitIds = applicationOrgUnits.Select(a => a.OrgUnitId).ToList();

        return applicationOrgUnitIds.Any(id => scope.AllowedOrgUnitIds.Contains(id));
    }

    public async Task<bool> CanViewOrgUnitAsync(Guid currentTenantUserId, Guid orgUnitId, CancellationToken cancellationToken = default)
    {
        var scope = await GetEffectiveScopeAsync(currentTenantUserId, cancellationToken);
        
        if (scope.IsGlobalAdmin)
        {
            return true;
        }

        return scope.AllowedOrgUnitIds.Contains(orgUnitId);
    }

    public async Task<bool> CanManageOrgUnitAsync(Guid currentTenantUserId, Guid orgUnitId, CancellationToken cancellationToken = default)
    {
        var scope = await GetEffectiveScopeAsync(currentTenantUserId, cancellationToken);
        
        if (scope.IsGlobalAdmin)
        {
            return true;
        }

        // Delegated admin can only manage OrgUnits in their root scope
        return scope.RootOrgUnitIds.Contains(orgUnitId);
    }

    public async Task<OrgScope> GetEffectiveScopeAsync(Guid currentTenantUserId, CancellationToken cancellationToken = default)
    {
        var currentUser = await _tenantUserRepository.GetByIdAsync(currentTenantUserId, cancellationToken);
        if (currentUser == null)
        {
            _logger.LogWarning("User not found: {TenantUserId}", currentTenantUserId);
            return new OrgScope { IsGlobalAdmin = false };
        }

        // Check if user is global tenant admin
        if (currentUser.IsAdmin)
        {
            // Check if they have delegated admin scopes
            var adminScopes = await _delegatedAdminRepository.GetByTenantUserIdAsync(currentTenantUserId, cancellationToken);
            if (!adminScopes.Any())
            {
                // Global admin without delegated scopes - full access
                var allOrgUnits = await _orgUnitRepository.GetByTenantIdAsync(currentUser.TenantId, cancellationToken);
                return new OrgScope
                {
                    IsGlobalAdmin = true,
                    AllowedOrgUnitIds = allOrgUnits.Select(o => o.Id).ToList(),
                    RootOrgUnitIds = allOrgUnits.Where(o => o.ParentId == null).Select(o => o.Id).ToList()
                };
            }
        }

        // User has delegated admin scopes - limited access
        var delegatedScopes = await _delegatedAdminRepository.GetByTenantUserIdAsync(currentTenantUserId, cancellationToken);
        if (!delegatedScopes.Any())
        {
            // Not an admin at all
            return new OrgScope { IsGlobalAdmin = false };
        }

        var allowedOrgUnitIds = new HashSet<Guid>();
        var rootOrgUnitIds = new List<Guid>();

        foreach (var scope in delegatedScopes)
        {
            rootOrgUnitIds.Add(scope.OrgUnitId);
            allowedOrgUnitIds.Add(scope.OrgUnitId);

            if (scope.ScopeType == Domain.Enums.AdminScopeType.OrgAndDescendants)
            {
                var descendants = await _orgUnitRepository.GetDescendantsAsync(scope.OrgUnitId, cancellationToken);
                foreach (var descendant in descendants)
                {
                    allowedOrgUnitIds.Add(descendant.Id);
                }
            }
        }

        return new OrgScope
        {
            IsGlobalAdmin = false,
            AllowedOrgUnitIds = allowedOrgUnitIds.ToList(),
            RootOrgUnitIds = rootOrgUnitIds
        };
    }
}

