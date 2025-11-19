using Onesign.Modules.Security.Domain.Enums;

namespace Onesign.Modules.Security.Domain.Entities;

public class SecurityPolicy
{
    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }
    public MfaRequirementLevel MfaRequirementLevel { get; private set; }
    public MfaRequirementLevel MfaRequirement => MfaRequirementLevel;
    public bool AllowMfaRememberDevice { get; private set; }
    public bool AllowTrustedDevices => AllowMfaRememberDevice;
    public int RememberDeviceDays { get; private set; }
    public int TrustedDeviceExpireDays => RememberDeviceDays;
    public bool RequireMfaForSensitiveApps { get; private set; }
    public int MaxFailedLoginAttempts { get; private set; }
    public int SessionTimeoutMinutes { get; private set; }
    public bool EnableGeoAnomalyDetection { get; private set; }
    public RiskLevel BlockLevel { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    private SecurityPolicy()
    {
    }

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
        Id = Guid.NewGuid();
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

    public static SecurityPolicy Create(
        Guid tenantId,
        MfaRequirementLevel mfaRequirement,
        bool allowTrustedDevices,
        int trustedDeviceExpireDays,
        int sessionTimeoutMinutes,
        int maxFailedLoginAttempts)
    {
        return new SecurityPolicy(
            tenantId,
            mfaRequirement,
            allowTrustedDevices,
            trustedDeviceExpireDays,
            false,
            maxFailedLoginAttempts,
            false,
            RiskLevel.Low);
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

    public void UpdateSettings(
        MfaRequirementLevel mfaRequirement,
        bool allowTrustedDevices,
        int trustedDeviceExpireDays,
        int sessionTimeoutMinutes,
        int maxFailedLoginAttempts)
    {
        MfaRequirementLevel = mfaRequirement;
        AllowMfaRememberDevice = allowTrustedDevices;
        RememberDeviceDays = trustedDeviceExpireDays;
        SessionTimeoutMinutes = sessionTimeoutMinutes;
        MaxFailedLoginAttempts = maxFailedLoginAttempts;
        UpdatedAt = DateTime.UtcNow;
    }
}
