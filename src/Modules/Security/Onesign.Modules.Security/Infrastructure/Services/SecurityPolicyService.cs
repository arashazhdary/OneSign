using Onesign.Modules.Security.Domain.Entities;
using Onesign.Modules.Security.Domain.Enums;
using Onesign.Modules.Security.Domain.Repositories;
using Onesign.Modules.Security.Domain.Services;

namespace Onesign.Modules.Security.Infrastructure.Services;

public class SecurityPolicyService : ISecurityPolicyService
{
    private readonly ISecurityPolicyRepository _securityPolicyRepository;
    private readonly IOrgUnitMfaRuleRepository _orgUnitMfaRuleRepository;

    public SecurityPolicyService(
        ISecurityPolicyRepository securityPolicyRepository,
        IOrgUnitMfaRuleRepository orgUnitMfaRuleRepository)
    {
        _securityPolicyRepository = securityPolicyRepository ?? throw new ArgumentNullException(nameof(securityPolicyRepository));
        _orgUnitMfaRuleRepository = orgUnitMfaRuleRepository ?? throw new ArgumentNullException(nameof(orgUnitMfaRuleRepository));
    }

    public async Task<SecurityPolicy> GetPolicyForTenantAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        if (tenantId == Guid.Empty)
            throw new ArgumentException("TenantId cannot be empty", nameof(tenantId));

        var policy = await _securityPolicyRepository.GetByTenantIdAsync(tenantId, cancellationToken);

        if (policy == null)
        {
            // Create default policy
            policy = CreateDefaultPolicy(tenantId);
            await _securityPolicyRepository.AddAsync(policy, cancellationToken);
        }

        return policy;
    }

    public async Task<SecurityPolicy> UpdatePolicyAsync(
        Guid tenantId,
        MfaRequirementLevel mfaRequirementLevel,
        bool allowMfaRememberDevice,
        int rememberDeviceDays,
        bool requireMfaForSensitiveApps,
        int maxFailedLoginAttempts,
        bool enableGeoAnomalyDetection,
        RiskLevel blockLevel,
        CancellationToken cancellationToken = default)
    {
        if (tenantId == Guid.Empty)
            throw new ArgumentException("TenantId cannot be empty", nameof(tenantId));

        if (rememberDeviceDays <= 0)
            throw new ArgumentException("RememberDeviceDays must be greater than 0", nameof(rememberDeviceDays));

        if (maxFailedLoginAttempts <= 0)
            throw new ArgumentException("MaxFailedLoginAttempts must be greater than 0", nameof(maxFailedLoginAttempts));

        var policy = await _securityPolicyRepository.GetByTenantIdAsync(tenantId, cancellationToken);

        if (policy == null)
        {
            // Create new policy
            policy = new SecurityPolicy(
                tenantId: tenantId,
                mfaRequirementLevel: mfaRequirementLevel,
                allowMfaRememberDevice: allowMfaRememberDevice,
                rememberDeviceDays: rememberDeviceDays,
                requireMfaForSensitiveApps: requireMfaForSensitiveApps,
                maxFailedLoginAttempts: maxFailedLoginAttempts,
                enableGeoAnomalyDetection: enableGeoAnomalyDetection,
                blockLevel: blockLevel
            );

            await _securityPolicyRepository.AddAsync(policy, cancellationToken);
        }
        else
        {
            // Update existing policy
            policy.Update(
                mfaRequirementLevel: mfaRequirementLevel,
                allowMfaRememberDevice: allowMfaRememberDevice,
                rememberDeviceDays: rememberDeviceDays,
                requireMfaForSensitiveApps: requireMfaForSensitiveApps,
                maxFailedLoginAttempts: maxFailedLoginAttempts,
                enableGeoAnomalyDetection: enableGeoAnomalyDetection,
                blockLevel: blockLevel
            );

            await _securityPolicyRepository.UpdateAsync(policy, cancellationToken);
        }

        return policy;
    }

    public async Task<bool> GetEffectiveMfaRequirementAsync(
        Guid tenantUserId,
        Guid tenantId,
        List<Guid> userOrgUnitIds,
        bool isAdmin,
        bool deviceTrusted,
        RiskLevel riskLevel,
        CancellationToken cancellationToken = default)
    {
        if (tenantUserId == Guid.Empty)
            throw new ArgumentException("TenantUserId cannot be empty", nameof(tenantUserId));

        if (tenantId == Guid.Empty)
            throw new ArgumentException("TenantId cannot be empty", nameof(tenantId));

        // Get security policy for tenant
        var policy = await GetPolicyForTenantAsync(tenantId, cancellationToken);

        // Rule 1: If MfaRequirementLevel is AllUsers, MFA is always required
        if (policy.MfaRequirementLevel == MfaRequirementLevel.AllUsers)
            return true;

        // Rule 2: If MfaRequirementLevel is AdminsOnly and user is admin, MFA is required
        if (policy.MfaRequirementLevel == MfaRequirementLevel.AdminsOnly && isAdmin)
            return true;

        // Rule 3: If device is trusted and policy allows remember device, MFA can be skipped
        // BUT: This can be overridden by risk level or org unit rules
        bool canSkipDueToTrustedDevice = deviceTrusted && policy.AllowMfaRememberDevice;

        // Rule 4: Risk-based override - If risk level is Medium or High, MFA is required regardless of trusted device
        if (riskLevel >= RiskLevel.Medium)
            return true;

        // Rule 5: Check OrgUnit-specific MFA rules
        if (userOrgUnitIds != null && userOrgUnitIds.Any())
        {
            // Get all MFA rules for the tenant
            var allRules = await _orgUnitMfaRuleRepository.GetByTenantIdAsync(tenantId, cancellationToken);

            // Check if any of the user's org units require MFA
            var userOrgUnitRules = allRules.Where(r => userOrgUnitIds.Contains(r.OrgUnitId)).ToList();

            if (userOrgUnitRules.Any(r => r.MfaRequired))
                return true;
        }

        // Rule 6: If we can skip due to trusted device and no other rules require MFA, skip it
        if (canSkipDueToTrustedDevice)
            return false;

        // Default: No MFA required if none of the above conditions are met
        return false;
    }

    public async Task<bool> ShouldBlockLoginAsync(
        RiskLevel riskLevel,
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        if (tenantId == Guid.Empty)
            throw new ArgumentException("TenantId cannot be empty", nameof(tenantId));

        var policy = await GetPolicyForTenantAsync(tenantId, cancellationToken);

        // Block login if risk level is greater than or equal to the policy's block level
        return riskLevel >= policy.BlockLevel;
    }

    private SecurityPolicy CreateDefaultPolicy(Guid tenantId)
    {
        // Default policy settings
        return new SecurityPolicy(
            tenantId: tenantId,
            mfaRequirementLevel: MfaRequirementLevel.None, // No MFA required by default
            allowMfaRememberDevice: true, // Allow remember device
            rememberDeviceDays: 30, // Remember for 30 days
            requireMfaForSensitiveApps: false, // Don't require MFA for sensitive apps by default
            maxFailedLoginAttempts: 5, // Allow 5 failed attempts
            enableGeoAnomalyDetection: true, // Enable geo anomaly detection
            blockLevel: RiskLevel.High // Only block on High risk by default
        );
    }

    public async Task<bool> IsMfaRequiredAsync(
        Guid tenantUserId,
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        return await GetEffectiveMfaRequirementAsync(
            tenantUserId,
            tenantId,
            new List<Guid>(),
            false,
            false,
            RiskLevel.Low,
            cancellationToken);
    }
}
