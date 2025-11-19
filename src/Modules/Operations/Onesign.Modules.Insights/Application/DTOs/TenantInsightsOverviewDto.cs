namespace Onesign.Modules.Insights.Application.DTOs;

public class TenantInsightsOverviewDto
{
    public Guid TenantId { get; set; }
    public DateOnly From { get; set; }
    public DateOnly To { get; set; }
    public List<TenantDailyUsageDataPointDto> TimeSeries { get; set; } = new();
    public TenantInsightsSummaryDto Summary { get; set; } = new();
}

public class TenantDailyUsageDataPointDto
{
    public DateOnly Date { get; set; }
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    public int MfaEnabledUsers { get; set; }
    public int TotalApplications { get; set; }
    public int ApplicationsWithSSOEnabled { get; set; }
    public int TotalSignInCount { get; set; }
    public int FailedSignInCount { get; set; }
    public int HighRiskSignInCount { get; set; }
    public int AccessRequestCount { get; set; }
    public int AccessRequestApprovedCount { get; set; }
    public int LifecycleEventsCount { get; set; }
    public int EmergencyAccessCount { get; set; }
}

public class TenantInsightsSummaryDto
{
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    public int MfaEnabledUsers { get; set; }
    public decimal MfaAdoptionPercent { get; set; }
    public int TotalApplications { get; set; }
    public int ApplicationsWithSSOEnabled { get; set; }
    public decimal SsoCoveragePercent { get; set; }
    public int TotalSignIns { get; set; }
    public int FailedSignIns { get; set; }
    public int HighRiskSignIns { get; set; }
    public decimal SignInSuccessRate { get; set; }
    public int TotalAccessRequests { get; set; }
    public int ApprovedAccessRequests { get; set; }
    public decimal AccessRequestApprovalRate { get; set; }
    public int LifecycleEvents { get; set; }
    public int EmergencyAccessEvents { get; set; }
    public decimal AverageActiveUsersPerDay { get; set; }
    public decimal AverageSignInsPerDay { get; set; }
}
