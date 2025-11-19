namespace Onesign.Modules.Insights.Infrastructure.EfCore.Entities;

public class TenantDailyUsageSnapshotEntity
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
    public int ActiveIncidents { get; set; }
    public int PendingChangeSets { get; set; }
    public int RiskyApplications { get; set; }
    public int SecurityScore { get; set; }
    public DateTime CreatedAt { get; set; }
}
