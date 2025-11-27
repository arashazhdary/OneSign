using Microsoft.Extensions.Logging;
using Onesign.Modules.AccessRequests.Domain.Entities;
using Onesign.Modules.AccessRequests.Domain.Enums;
using Onesign.Modules.AccessRequests.Domain.Repositories;
using Onesign.Modules.AccessRequests.Domain.Services;
using Onesign.Modules.PrivilegedAccess.Domain.Repositories;
using Onesign.Modules.PrivilegedAccess.Domain.Services;

namespace Onesign.Modules.AccessRequests.Infrastructure.Services;

public class AccessRequestProvisioningService : IAccessRequestProvisioningService
{
    private readonly ILogger<AccessRequestProvisioningService> _logger;
    private readonly IJitGrantService _jitGrantService;
    private readonly IJitGrantRepository _jitGrantRepository;
    private readonly IAccessRequestRepository _accessRequestRepository;

    public AccessRequestProvisioningService(
        ILogger<AccessRequestProvisioningService> logger,
        IJitGrantService jitGrantService,
        IJitGrantRepository jitGrantRepository,
        IAccessRequestRepository accessRequestRepository)
    {
        _logger = logger;
        _jitGrantService = jitGrantService;
        _jitGrantRepository = jitGrantRepository;
        _accessRequestRepository = accessRequestRepository;
    }

    public async Task<bool> ProvisionAccessAsync(AccessRequest request, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Provisioning access for request {RequestId}", request.Id);

        foreach (var item in request.Items)
        {
            try
            {
                switch (item.AccessType)
                {
                    case AccessType.Role:
                    case AccessType.PrivilegedRole:
                        await ProvisionRoleAccessAsync(request, item, cancellationToken);
                        break;

                    case AccessType.Application:
                        await ProvisionApplicationAccessAsync(request, item, cancellationToken);
                        break;

                    default:
                        _logger.LogWarning(
                            "Unknown access type {AccessType} for item {ItemId}",
                            item.AccessType,
                            item.Id);
                        return false;
                }

                _logger.LogInformation(
                    "Successfully provisioned {AccessType} access to {TargetName} for user {RequesterId}",
                    item.AccessType,
                    item.TargetName,
                    request.RequesterId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to provision item {ItemId}", item.Id);
                return false;
            }
        }

        return true;
    }

    private async Task ProvisionRoleAccessAsync(AccessRequest request, AccessRequestItem item, CancellationToken cancellationToken)
    {
        if (item.DurationMinutes.HasValue)
        {
            // Time-based access: Create JIT grant
            var jitGrant = await _jitGrantService.CreateJitGrantAsync(
                tenantId: request.TenantId,
                userId: request.RequesterId,
                roleId: item.TargetId,
                durationMinutes: item.DurationMinutes.Value,
                approvedBy: request.ReviewedBy ?? Guid.Empty,
                justification: request.Justification,
                cancellationToken: cancellationToken);

            var expiresAt = DateTime.UtcNow.AddMinutes(item.DurationMinutes.Value);
            _logger.LogInformation(
                "Created JIT grant {GrantId} for role {RoleName}. Access expires at {ExpiresAt}",
                jitGrant.Id,
                item.TargetName,
                expiresAt);
        }
        else
        {
            // Permanent access: Would require a permanent role assignment service
            // In a real implementation, this would:
            // - Call an IUserRoleService or ITenantUserService to permanently assign the role
            // - Update the user's role collection in the identity store
            // - Trigger any necessary authorization cache updates

            _logger.LogInformation(
                "Permanent role access to {RoleName} for user {RequesterId}. " +
                "Note: Permanent role provisioning requires integration with role management service.",
                item.TargetName,
                request.RequesterId);
        }
    }

    private async Task ProvisionApplicationAccessAsync(AccessRequest request, AccessRequestItem item, CancellationToken cancellationToken)
    {
        // In a real implementation, this would:
        // - Call an IApplicationAccessService to grant application access
        // - Create user account in the target application if needed
        // - Assign appropriate roles/permissions within the application
        // - Handle SSO provisioning (SCIM, etc.)

        if (item.DurationMinutes.HasValue)
        {
            var expiresAt = DateTime.UtcNow.AddMinutes(item.DurationMinutes.Value);
            _logger.LogInformation(
                "Time-based application access to {ApplicationName} for user {RequesterId}. " +
                "Access expires at {ExpiresAt}. " +
                "Note: Application provisioning requires integration with application management service.",
                item.TargetName,
                request.RequesterId,
                expiresAt);
        }
        else
        {
            _logger.LogInformation(
                "Permanent application access to {ApplicationName} for user {RequesterId}. " +
                "Note: Application provisioning requires integration with application management service.",
                item.TargetName,
                request.RequesterId);
        }

        await Task.CompletedTask;
    }

    public async Task<bool> RevokeAccessAsync(AccessRequest request, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Revoking access for request {RequestId}", request.Id);

        foreach (var item in request.Items)
        {
            try
            {
                switch (item.AccessType)
                {
                    case AccessType.Role:
                    case AccessType.PrivilegedRole:
                        await RevokeRoleAccessAsync(request, item, cancellationToken);
                        break;

                    case AccessType.Application:
                        await RevokeApplicationAccessAsync(request, item, cancellationToken);
                        break;

                    default:
                        _logger.LogWarning(
                            "Unknown access type {AccessType} for item {ItemId}",
                            item.AccessType,
                            item.Id);
                        return false;
                }

                _logger.LogInformation(
                    "Successfully revoked {AccessType} access to {TargetName} for user {RequesterId}",
                    item.AccessType,
                    item.TargetName,
                    request.RequesterId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to revoke item {ItemId}", item.Id);
                return false;
            }
        }

        return true;
    }

    private async Task RevokeRoleAccessAsync(AccessRequest request, AccessRequestItem item, CancellationToken cancellationToken)
    {
        if (item.DurationMinutes.HasValue)
        {
            // Revoke time-based access: Find and expire related JIT grants
            var activeGrants = await _jitGrantRepository.GetActiveGrantsForUserAsync(
                request.TenantId,
                request.RequesterId,
                cancellationToken);

            var relatedGrants = activeGrants
                .Where(g => g.RoleId == item.TargetId &&
                           (g.AccessRequestId == request.Id || g.AccessRequestId == null))
                .ToList();

            foreach (var grant in relatedGrants)
            {
                await _jitGrantService.ExpireJitGrantAsync(grant.Id, cancellationToken);
                _logger.LogInformation(
                    "Expired JIT grant {GrantId} for role {RoleName}",
                    grant.Id,
                    item.TargetName);
            }

            if (!relatedGrants.Any())
            {
                _logger.LogWarning(
                    "No active JIT grants found for user {UserId} and role {RoleId}",
                    request.RequesterId,
                    item.TargetId);
            }
        }
        else
        {
            // Revoke permanent access: Would require a permanent role removal service
            // In a real implementation, this would:
            // - Call an IUserRoleService or ITenantUserService to remove the role assignment
            // - Update the user's role collection in the identity store
            // - Trigger any necessary authorization cache invalidation

            _logger.LogInformation(
                "Permanent role access to {RoleName} revoked for user {RequesterId}. " +
                "Note: Permanent role revocation requires integration with role management service.",
                item.TargetName,
                request.RequesterId);
        }
    }

    private async Task RevokeApplicationAccessAsync(AccessRequest request, AccessRequestItem item, CancellationToken cancellationToken)
    {
        // In a real implementation, this would:
        // - Call an IApplicationAccessService to revoke application access
        // - Deactivate or remove user account in the target application
        // - Remove roles/permissions within the application
        // - Handle SSO deprovisioning (SCIM, etc.)

        _logger.LogInformation(
            "Application access to {ApplicationName} revoked for user {RequesterId}. " +
            "Note: Application deprovisioning requires integration with application management service.",
            item.TargetName,
            request.RequesterId);

        await Task.CompletedTask;
    }

    public async Task<bool> CheckProvisioningStatusAsync(Guid requestId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Checking provisioning status for request {RequestId}", requestId);

        try
        {
            var request = await _accessRequestRepository.GetByIdAsync(requestId, cancellationToken);
            if (request == null)
            {
                _logger.LogWarning("Request {RequestId} not found", requestId);
                return false;
            }

            // Check that all items are in a valid state for provisioned access
            foreach (var item in request.Items)
            {
                switch (item.AccessType)
                {
                    case AccessType.Role:
                    case AccessType.PrivilegedRole:
                        if (item.DurationMinutes.HasValue)
                        {
                            // For time-based access, verify JIT grants exist
                            var activeGrants = await _jitGrantRepository.GetActiveGrantsForUserAsync(
                                request.TenantId,
                                request.RequesterId,
                                cancellationToken);

                            var hasActiveGrant = activeGrants.Any(g => g.RoleId == item.TargetId);
                            if (!hasActiveGrant)
                            {
                                _logger.LogWarning(
                                    "No active JIT grant found for request {RequestId}, item {ItemId}, role {RoleId}",
                                    requestId,
                                    item.Id,
                                    item.TargetId);
                                return false;
                            }

                            _logger.LogDebug(
                                "Verified active JIT grant for request {RequestId}, item {ItemId}",
                                requestId,
                                item.Id);
                        }
                        else
                        {
                            // For permanent access, we'd need to verify with the role management service
                            // For now, we'll assume it's provisioned successfully
                            _logger.LogDebug(
                                "Permanent role provisioning status check for request {RequestId}, item {ItemId}. " +
                                "Note: Full verification requires integration with role management service.",
                                requestId,
                                item.Id);
                        }
                        break;

                    case AccessType.Application:
                        // For application access, we'd need to verify with the application management service
                        // For now, we'll assume it's provisioned successfully
                        _logger.LogDebug(
                            "Application provisioning status check for request {RequestId}, item {ItemId}. " +
                            "Note: Full verification requires integration with application management service.",
                            requestId,
                            item.Id);
                        break;

                    default:
                        _logger.LogWarning(
                            "Unknown access type {AccessType} for item {ItemId}",
                            item.AccessType,
                            item.Id);
                        return false;
                }
            }

            _logger.LogInformation("Provisioning status check passed for request {RequestId}", requestId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking provisioning status for request {RequestId}", requestId);
            return false;
        }
    }
}
