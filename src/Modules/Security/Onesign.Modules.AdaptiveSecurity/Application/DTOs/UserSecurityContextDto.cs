namespace Onesign.Modules.AdaptiveSecurity.Application.DTOs;

public class UserSecurityContextDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public int CurrentRiskScore { get; set; }
    public string RiskFactorsJson { get; set; } = "[]";
    public string? LastLoginLocation { get; set; }
    public string? LastLoginDevice { get; set; }
    public string TrustedDevicesJson { get; set; } = "[]";
    public string TrustedLocationsJson { get; set; } = "[]";
    public DateTime UpdatedAt { get; set; }
}
