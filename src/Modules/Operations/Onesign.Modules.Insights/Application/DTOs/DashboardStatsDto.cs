namespace Onesign.Modules.Insights.Application.DTOs;

/// <summary>
/// Dashboard statistics for admin portal
/// </summary>
public class DashboardStatsDto
{
    /// <summary>
    /// Summary statistics
    /// </summary>
    public DashboardSummaryDto Summary { get; set; } = new();

    /// <summary>
    /// Authentication trend for the last 7 days
    /// </summary>
    public List<AuthenticationTrendItemDto> AuthenticationTrend { get; set; } = new();

    /// <summary>
    /// MFA adoption distribution
    /// </summary>
    public MfaDistributionDto MfaDistribution { get; set; } = new();

    /// <summary>
    /// Risk distribution by severity
    /// </summary>
    public RiskDistributionDto RiskDistribution { get; set; } = new();

    /// <summary>
    /// Top tenants by user count
    /// </summary>
    public List<TopTenantDto> TopTenants { get; set; } = new();

    /// <summary>
    /// Recent security events
    /// </summary>
    public List<SecurityEventDto> RecentSecurityEvents { get; set; } = new();
}

public class DashboardSummaryDto
{
    public int TotalTenants { get; set; }
    public int ActiveTenants { get; set; }
    public int TotalUsers { get; set; }
    public int ActiveUsersToday { get; set; }
    public int TotalApplications { get; set; }
    public int TotalAuthenticationsToday { get; set; }
    public int FailedAuthenticationsToday { get; set; }
    public decimal AuthSuccessRate { get; set; }
    public decimal MfaAdoptionRate { get; set; }
    public int HighRiskUsers { get; set; }
    public int PendingAccessRequests { get; set; }
}

public class AuthenticationTrendItemDto
{
    public string Date { get; set; } = string.Empty;
    public string DayName { get; set; } = string.Empty;
    public int SuccessfulLogins { get; set; }
    public int FailedLogins { get; set; }
    public int MfaChallenges { get; set; }
    public int UniqueUsers { get; set; }
}

public class MfaDistributionDto
{
    public int UsersWithMfa { get; set; }
    public int UsersWithoutMfa { get; set; }
    public decimal MfaAdoptionPercent { get; set; }
    public List<MfaMethodCountDto> MethodBreakdown { get; set; } = new();
}

public class MfaMethodCountDto
{
    public string Method { get; set; } = string.Empty;
    public int Count { get; set; }
    public decimal Percentage { get; set; }
}

public class RiskDistributionDto
{
    public int HighRiskCount { get; set; }
    public int MediumRiskCount { get; set; }
    public int LowRiskCount { get; set; }
    public int NoRiskCount { get; set; }
    public List<RiskEventTypeCountDto> EventTypeBreakdown { get; set; } = new();
}

public class RiskEventTypeCountDto
{
    public string EventType { get; set; } = string.Empty;
    public int Count { get; set; }
    public string Severity { get; set; } = string.Empty;
}

public class TopTenantDto
{
    public Guid TenantId { get; set; }
    public string TenantName { get; set; } = string.Empty;
    public int UserCount { get; set; }
    public int ApplicationCount { get; set; }
    public int AuthenticationsToday { get; set; }
    public decimal MfaAdoptionPercent { get; set; }
    public string RiskLevel { get; set; } = "Low";
}

public class SecurityEventDto
{
    public Guid Id { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string TenantName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}
