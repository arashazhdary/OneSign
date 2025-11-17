namespace Onesign.Modules.Billing.Domain.Entities;

public class TenantUsageSnapshot
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public DateTime CapturedAt { get; set; }

    public int UserCount { get; set; }
    public int ActiveUsersLast30Days { get; set; }
    public int ApplicationCount { get; set; }
    public int IdpConnectionCount { get; set; }
    public int OrgUnitCount { get; set; }
    public long LoginsThisMonth { get; set; }
    public long ScimCallsThisMonth { get; set; }
}
