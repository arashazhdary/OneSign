namespace Onesign.Modules.Billing.Application.DTOs;

public class TenantUsageSummaryDto
{
    public Guid TenantId { get; set; }
    public string TenantName { get; set; } = string.Empty;

    // Subscription info
    public TenantSubscriptionDto? Subscription { get; set; }

    // Current usage
    public int UserCount { get; set; }
    public int ApplicationCount { get; set; }
    public int IdpConnectionCount { get; set; }
    public int OrgUnitCount { get; set; }
    public long LoginsThisMonth { get; set; }
    public long ScimCallsThisMonth { get; set; }

    // Limits from plan
    public int? MaxUsers { get; set; }
    public int? MaxApplications { get; set; }
    public int? MaxIdpConnections { get; set; }
    public int? MaxOrgUnits { get; set; }
    public long? MaxLoginsPerMonth { get; set; }

    // Quota status
    public TenantQuotaStatusDto? QuotaStatus { get; set; }

    public DateTime LastUpdated { get; set; }
}
