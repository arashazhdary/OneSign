namespace Onesign.Modules.Incidents.Application.DTOs;

public class IncidentStatisticsDto
{
    public Guid TenantId { get; set; }
    public int TotalIncidents { get; set; }
    public int NewIncidents { get; set; }
    public int AcknowledgedIncidents { get; set; }
    public int InvestigatingIncidents { get; set; }
    public int ContainmentIncidents { get; set; }
    public int RemediationIncidents { get; set; }
    public int ResolvedIncidents { get; set; }
    public int ClosedIncidents { get; set; }
    public int CriticalIncidents { get; set; }
    public int HighIncidents { get; set; }
    public int MediumIncidents { get; set; }
    public int LowIncidents { get; set; }
    public int InformationalIncidents { get; set; }
    public decimal MeanTimeToAcknowledge { get; set; }
    public decimal MeanTimeToResolve { get; set; }
    public decimal MeanTimeToClose { get; set; }
    public List<IncidentCategoryStatDto> ByCategory { get; set; } = new();
    public List<IncidentTrendDto> DailyTrend { get; set; } = new();
}

public class IncidentCategoryStatDto
{
    public string Category { get; set; } = string.Empty;
    public int Count { get; set; }
    public decimal Percentage { get; set; }
}

public class IncidentTrendDto
{
    public DateOnly Date { get; set; }
    public int Created { get; set; }
    public int Resolved { get; set; }
    public int Closed { get; set; }
}
