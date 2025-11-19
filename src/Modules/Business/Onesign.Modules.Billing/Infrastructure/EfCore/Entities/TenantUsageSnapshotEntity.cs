using Onesign.Modules.Billing.Domain.Entities;

namespace Onesign.Modules.Billing.Infrastructure.EfCore.Entities;

public class TenantUsageSnapshotEntity
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

    public TenantUsageSnapshot ToDomain()
    {
        return new TenantUsageSnapshot
        {
            Id = Id,
            TenantId = TenantId,
            CapturedAt = CapturedAt,
            UserCount = UserCount,
            ActiveUsersLast30Days = ActiveUsersLast30Days,
            ApplicationCount = ApplicationCount,
            IdpConnectionCount = IdpConnectionCount,
            OrgUnitCount = OrgUnitCount,
            LoginsThisMonth = LoginsThisMonth,
            ScimCallsThisMonth = ScimCallsThisMonth
        };
    }

    public static TenantUsageSnapshotEntity FromDomain(TenantUsageSnapshot snapshot)
    {
        return new TenantUsageSnapshotEntity
        {
            Id = snapshot.Id,
            TenantId = snapshot.TenantId,
            CapturedAt = snapshot.CapturedAt,
            UserCount = snapshot.UserCount,
            ActiveUsersLast30Days = snapshot.ActiveUsersLast30Days,
            ApplicationCount = snapshot.ApplicationCount,
            IdpConnectionCount = snapshot.IdpConnectionCount,
            OrgUnitCount = snapshot.OrgUnitCount,
            LoginsThisMonth = snapshot.LoginsThisMonth,
            ScimCallsThisMonth = snapshot.ScimCallsThisMonth
        };
    }
}
