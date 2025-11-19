namespace Onesign.Modules.Insights.Domain.Entities;

public class ApplicationDailyUsageSnapshot
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid ApplicationId { get; set; }
    public DateOnly Date { get; set; }
    public int UniqueUsers { get; set; }
    public int SignInCount { get; set; }
    public int FailedSignInCount { get; set; }
    public int HighRiskSignInCount { get; set; }
    public DateTime CreatedAt { get; set; }
}
