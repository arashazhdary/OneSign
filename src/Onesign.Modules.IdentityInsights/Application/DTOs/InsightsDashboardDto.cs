namespace Onesign.Modules.IdentityInsights.Application.DTOs;

public class InsightsDashboardDto
{
    public int TotalInsights { get; set; }
    public int OpenInsights { get; set; }
    public int ResolvedInsights { get; set; }
    public int DismissedInsights { get; set; }
    public int CriticalInsights { get; set; }
    public int HighInsights { get; set; }
    public int MediumInsights { get; set; }
    public int LowInsights { get; set; }
    public Dictionary<string, int> InsightsByType { get; set; } = new();
    public List<InsightDetailDto> RecentInsights { get; set; } = new();
}
