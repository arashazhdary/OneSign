using Onesign.Modules.Security.Domain.Enums;

namespace Onesign.Modules.Security.Domain.Entities;

public class SecurityPolicy
{
    public Guid TenantId { get; private set; }
    public MfaRequirementLevel MfaRequirementLevel { get; private set; }
    public bool AllowMfaRememberDevice { get; private set; }
    public int RememberDeviceDays { get; private set; }
    public bool RequireMfaForSensitiveApps { get; private set; }
    public int MaxFailedLoginAttempts { get; private set; }
    public bool EnableGeoAnomalyDetection { get; private set; }
    public RiskLevel BlockLevel { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    public SecurityPolicy(
        Guid tenantId,
        MfaRequirementLevel mfaRequirementLevel,
        bool allowMfaRememberDevice,
        int rememberDeviceDays,
        bool requireMfaForSensitiveApps,
        int maxFailedLoginAttempts,
        bool enableGeoAnomalyDetection,
        RiskLevel blockLevel)
    {
        TenantId = tenantId;
        MfaRequirementLevel = mfaRequirementLevel;
        AllowMfaRememberDevice = allowMfaRememberDevice;
        RememberDeviceDays = rememberDeviceDays;
        RequireMfaForSensitiveApps = requireMfaForSensitiveApps;
        MaxFailedLoginAttempts = maxFailedLoginAttempts;
        EnableGeoAnomalyDetection = enableGeoAnomalyDetection;
        BlockLevel = blockLevel;
        CreatedAt = DateTime.UtcNow;
    }

    public void Update(
        MfaRequirementLevel mfaRequirementLevel,
        bool allowMfaRememberDevice,
        int rememberDeviceDays,
        bool requireMfaForSensitiveApps,
        int maxFailedLoginAttempts,
        bool enableGeoAnomalyDetection,
        RiskLevel blockLevel)
    {
        MfaRequirementLevel = mfaRequirementLevel;
        AllowMfaRememberDevice = allowMfaRememberDevice;
        RememberDeviceDays = rememberDeviceDays;
        RequireMfaForSensitiveApps = requireMfaForSensitiveApps;
        MaxFailedLoginAttempts = maxFailedLoginAttempts;
        EnableGeoAnomalyDetection = enableGeoAnomalyDetection;
        BlockLevel = blockLevel;
        UpdatedAt = DateTime.UtcNow;
    }
}
