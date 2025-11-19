namespace Onesign.Modules.Insights.Domain.Entities;

public class TenantDailyUsageSnapshot
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
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
    public DateTime CreatedAt { get; set; }
}
