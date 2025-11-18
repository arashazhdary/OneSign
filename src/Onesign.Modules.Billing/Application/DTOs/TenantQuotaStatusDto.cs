namespace Onesign.Modules.Billing.Application.DTOs;

public class TenantQuotaStatusDto
{
    public Guid TenantId { get; set; }

    public int UserCount { get; set; }
    public int? MaxUsers { get; set; }
    public double? UserUsagePercent { get; set; }
    public bool IsNearUserLimit { get; set; }
    public bool IsOverUserLimit { get; set; }

    public int ApplicationCount { get; set; }
    public int? MaxApplications { get; set; }
    public double? ApplicationUsagePercent { get; set; }
    public bool IsNearApplicationLimit { get; set; }
    public bool IsOverApplicationLimit { get; set; }

    public int IdpConnectionCount { get; set; }
    public int? MaxIdpConnections { get; set; }
    public double? IdpUsagePercent { get; set; }
    public bool IsNearIdpLimit { get; set; }
    public bool IsOverIdpLimit { get; set; }

    public long LoginsThisMonth { get; set; }
    public long? MaxLoginsPerMonth { get; set; }
    public double? LoginUsagePercent { get; set; }
    public bool IsNearLoginLimit { get; set; }
    public bool IsOverLoginLimit { get; set; }
}
