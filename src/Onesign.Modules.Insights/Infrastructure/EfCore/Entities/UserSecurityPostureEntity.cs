namespace Onesign.Modules.Insights.Infrastructure.EfCore.Entities;

public class UserSecurityPostureEntity
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public DateTime? LastSignInAt { get; set; }
    public bool MfaEnabled { get; set; }
    public int EnabledAppsCount { get; set; }
    public int UsedAppsLast30DaysCount { get; set; }
    public int HighRiskEventsLast30Days { get; set; }
    public bool IsAnonymized { get; set; }
    public DateTime UpdatedAt { get; set; }
}
