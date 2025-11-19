namespace Onesign.Modules.Insights.Application.DTOs;

public class GlobalTenantOverviewDto
{
    public List<TenantOverviewItemDto> Tenants { get; set; } = new();
    public GlobalSummaryDto Summary { get; set; } = new();
}

public class TenantOverviewItemDto
{
    public Guid TenantId { get; set; }
    public DateOnly Date { get; set; }
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    public int MfaEnabledUsers { get; set; }
    public decimal MfaAdoptionPercent { get; set; }
    public int TotalApplications { get; set; }
    public int ApplicationsWithSSOEnabled { get; set; }
    public decimal SsoCoveragePercent { get; set; }
    public int TotalSignInCount { get; set; }
    public int FailedSignInCount { get; set; }
    public int HighRiskSignInCount { get; set; }
    public decimal SignInSuccessRate { get; set; }
    public int AccessRequestCount { get; set; }
    public int LifecycleEventsCount { get; set; }
    public int EmergencyAccessCount { get; set; }
    public string RiskLevel { get; set; } = string.Empty;
}

public class GlobalSummaryDto
{
    public int TotalTenants { get; set; }
    public int TotalUsers { get; set; }
    public int TotalActiveUsers { get; set; }
    public int TotalApplications { get; set; }
    public int TotalSignIns { get; set; }
    public int TotalFailedSignIns { get; set; }
    public int TotalHighRiskSignIns { get; set; }
    public decimal AverageMfaAdoptionPercent { get; set; }
    public decimal AverageSsoCoveragePercent { get; set; }
    public decimal OverallSignInSuccessRate { get; set; }
    public int HighRiskTenants { get; set; }
    public int MediumRiskTenants { get; set; }
    public int LowRiskTenants { get; set; }
}
