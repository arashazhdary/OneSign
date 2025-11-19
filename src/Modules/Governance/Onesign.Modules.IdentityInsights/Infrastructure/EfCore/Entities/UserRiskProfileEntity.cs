namespace Onesign.Modules.IdentityInsights.Infrastructure.EfCore.Entities;

public class UserRiskProfileEntity
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public string UserDisplayName { get; set; } = string.Empty;
    public int RiskScore { get; set; }
    public string RiskFactorsJson { get; set; } = "[]";
    public DateTime? LastLoginAt { get; set; }
    public int FailedLoginCount { get; set; }
    public bool MfaEnabled { get; set; }
    public int PrivilegedRolesCount { get; set; }
    public int ApplicationsCount { get; set; }
    public DateTime CalculatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
