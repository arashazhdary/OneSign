using Onesign.Modules.Security.Domain.Entities;
using Onesign.Modules.Security.Domain.Enums;

namespace Onesign.Modules.Security.Infrastructure.EfCore.Entities;

public class SecurityPolicyEntity
{
    public Guid TenantId { get; set; }
    public MfaRequirementLevel MfaRequirementLevel { get; set; }
    public bool AllowMfaRememberDevice { get; set; }
    public int RememberDeviceDays { get; set; }
    public bool RequireMfaForSensitiveApps { get; set; }
    public int MaxFailedLoginAttempts { get; set; }
    public bool EnableGeoAnomalyDetection { get; set; }
    public RiskLevel BlockLevel { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public static SecurityPolicyEntity FromDomain(SecurityPolicy domain)
    {
        return new SecurityPolicyEntity
        {
            TenantId = domain.TenantId,
            MfaRequirementLevel = domain.MfaRequirementLevel,
            AllowMfaRememberDevice = domain.AllowMfaRememberDevice,
            RememberDeviceDays = domain.RememberDeviceDays,
            RequireMfaForSensitiveApps = domain.RequireMfaForSensitiveApps,
            MaxFailedLoginAttempts = domain.MaxFailedLoginAttempts,
            EnableGeoAnomalyDetection = domain.EnableGeoAnomalyDetection,
            BlockLevel = domain.BlockLevel,
            CreatedAt = domain.CreatedAt,
            UpdatedAt = domain.UpdatedAt
        };
    }

    public SecurityPolicy ToDomain()
    {
        var policy = new SecurityPolicy(
            TenantId,
            MfaRequirementLevel,
            AllowMfaRememberDevice,
            RememberDeviceDays,
            RequireMfaForSensitiveApps,
            MaxFailedLoginAttempts,
            EnableGeoAnomalyDetection,
            BlockLevel
        );

        typeof(SecurityPolicy).GetProperty(nameof(CreatedAt))!
            .SetValue(policy, CreatedAt);
        typeof(SecurityPolicy).GetProperty(nameof(UpdatedAt))!
            .SetValue(policy, UpdatedAt);

        return policy;
    }
}
