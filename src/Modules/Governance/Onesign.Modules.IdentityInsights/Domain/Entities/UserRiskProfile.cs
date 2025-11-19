namespace Onesign.Modules.IdentityInsights.Domain.Entities;

public class UserRiskProfile
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public string UserDisplayName { get; set; } = string.Empty;
    public int RiskScore { get; set; } // 0-100
    public string RiskFactorsJson { get; set; } = "[]"; // JSON array of risk factors
    public DateTime? LastLoginAt { get; set; }
    public int FailedLoginCount { get; set; }
    public bool MfaEnabled { get; set; }
    public int PrivilegedRolesCount { get; set; }
    public int ApplicationsCount { get; set; }
    public DateTime CalculatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
