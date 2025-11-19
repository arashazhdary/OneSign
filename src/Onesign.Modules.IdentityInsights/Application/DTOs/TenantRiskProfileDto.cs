namespace Onesign.Modules.IdentityInsights.Application.DTOs;

public class TenantRiskProfileDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public int RiskScore { get; set; }
    public int UsersCount { get; set; }
    public int HighRiskUsersCount { get; set; }
    public decimal MfaEnrollmentRate { get; set; }
    public int PrivilegedUsersCount { get; set; }
    public decimal FailedLoginRate { get; set; }
    public int OpenGovernanceFindingsCount { get; set; }
    public DateTime CalculatedAt { get; set; }
}
