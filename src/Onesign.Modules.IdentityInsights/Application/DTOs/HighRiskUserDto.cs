namespace Onesign.Modules.IdentityInsights.Application.DTOs;

public class HighRiskUserDto
{
    public Guid UserId { get; set; }
    public string UserDisplayName { get; set; } = string.Empty;
    public int RiskScore { get; set; }
    public List<string> RiskFactors { get; set; } = new();
    public DateTime? LastLoginAt { get; set; }
    public bool MfaEnabled { get; set; }
    public int PrivilegedRolesCount { get; set; }
    public int ApplicationsCount { get; set; }
    public DateTime CalculatedAt { get; set; }
}
