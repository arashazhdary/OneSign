using Onesign.Modules.AdaptiveSecurity.Domain.Enums;

namespace Onesign.Modules.AdaptiveSecurity.Domain.Entities;

public class UserSecurityContext
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public int CurrentRiskScore { get; set; }
    public RiskLevel RiskLevel { get; set; }
    public string RiskFactorsJson { get; set; } = "[]";
    public string? LastIpAddress { get; set; }
    public string? LastCountry { get; set; }
    public string? LastDeviceId { get; set; }
    public string? LastLoginLocation { get; set; }
    public string? LastLoginDevice { get; set; }
    public string TrustedDevicesJson { get; set; } = "[]";
    public string TrustedLocationsJson { get; set; } = "[]";
    public int FailedLoginAttempts { get; set; }
    public DateTime? LastSuccessfulLoginAt { get; set; }
    public DateTime? LastFailedLoginAt { get; set; }
    public bool ImpossibleTravelDetected { get; set; }
    public bool MfaEnabled { get; set; }
    public bool IsNewDevice { get; set; }
    public int KnownDevicesCount { get; set; }
    public DateTime LastEvaluatedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
