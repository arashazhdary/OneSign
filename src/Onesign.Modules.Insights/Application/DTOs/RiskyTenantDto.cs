namespace Onesign.Modules.Insights.Application.DTOs;

public class RiskyTenantDto
{
    public Guid TenantId { get; set; }
    public string RiskLevel { get; set; } = string.Empty;
    public int RiskScore { get; set; }
    public List<string> RiskFactors { get; set; } = new();
    public int TotalUsers { get; set; }
    public int MfaEnabledUsers { get; set; }
    public decimal MfaAdoptionPercent { get; set; }
    public int HighRiskSignInsLast30Days { get; set; }
    public int FailedSignInsLast30Days { get; set; }
    public int EmergencyAccessEventsLast30Days { get; set; }
    public DateOnly LastSnapshotDate { get; set; }
}

public class RiskyTenantsListDto
{
    public List<RiskyTenantDto> Tenants { get; set; } = new();
    public int TotalCount { get; set; }
    public int HighRiskCount { get; set; }
    public int MediumRiskCount { get; set; }
}
