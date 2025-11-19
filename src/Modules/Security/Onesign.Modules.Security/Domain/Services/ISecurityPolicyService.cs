using Onesign.Modules.Security.Domain.Entities;
using Onesign.Modules.Security.Domain.Enums;

namespace Onesign.Modules.Security.Domain.Services;

public interface ISecurityPolicyService
{
    Task<SecurityPolicy> GetPolicyForTenantAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default);

    Task<SecurityPolicy> UpdatePolicyAsync(
        Guid tenantId,
        MfaRequirementLevel mfaRequirementLevel,
        bool allowMfaRememberDevice,
        int rememberDeviceDays,
        bool requireMfaForSensitiveApps,
        int maxFailedLoginAttempts,
        bool enableGeoAnomalyDetection,
        RiskLevel blockLevel,
        CancellationToken cancellationToken = default);

    Task<bool> GetEffectiveMfaRequirementAsync(
        Guid tenantUserId,
        Guid tenantId,
        List<Guid> userOrgUnitIds,
        bool isAdmin,
        bool deviceTrusted,
        RiskLevel riskLevel,
        CancellationToken cancellationToken = default);

    Task<bool> ShouldBlockLoginAsync(
        RiskLevel riskLevel,
        Guid tenantId,
        CancellationToken cancellationToken = default);

    Task<bool> IsMfaRequiredAsync(
        Guid tenantUserId,
        Guid tenantId,
        CancellationToken cancellationToken = default);
}
