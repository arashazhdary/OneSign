namespace Onesign.Modules.Insights.Application.DTOs;

public class UserSecurityPostureDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public DateTime? LastSignInAt { get; set; }
    public bool MfaEnabled { get; set; }
    public int EnabledAppsCount { get; set; }
    public int UsedAppsLast30DaysCount { get; set; }
    public int HighRiskEventsLast30Days { get; set; }
    public bool IsAnonymized { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string RiskLevel { get; set; } = string.Empty;
}

public class UserSecurityPostureListDto
{
    public Guid TenantId { get; set; }
    public List<UserSecurityPostureDto> Users { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public UserSecurityPostureSummaryDto Summary { get; set; } = new();
}

public class UserSecurityPostureSummaryDto
{
    public int TotalUsers { get; set; }
    public int UsersWithMfa { get; set; }
    public int UsersWithoutMfa { get; set; }
    public decimal MfaAdoptionPercent { get; set; }
    public int HighRiskUsers { get; set; }
    public int MediumRiskUsers { get; set; }
    public int LowRiskUsers { get; set; }
    public int InactiveUsers { get; set; }
}
