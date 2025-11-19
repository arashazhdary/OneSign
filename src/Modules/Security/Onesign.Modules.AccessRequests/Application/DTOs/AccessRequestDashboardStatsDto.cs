namespace Onesign.Modules.AccessRequests.Application.DTOs;

public class AccessRequestDashboardStatsDto
{
    public int TotalRequests { get; set; }
    public int PendingRequests { get; set; }
    public int ApprovedRequests { get; set; }
    public int RejectedRequests { get; set; }
    public int CancelledRequests { get; set; }
    public double AverageApprovalTimeHours { get; set; }
    public int RequestsNearingSla { get; set; }
    public int SlaBreaches { get; set; }
    public List<RequestsByAccessType> ByAccessType { get; set; } = new();
    public List<RequestsByDay> LastSevenDays { get; set; } = new();
}

public class RequestsByAccessType
{
    public string AccessType { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class RequestsByDay
{
    public DateTime Date { get; set; }
    public int Submitted { get; set; }
    public int Approved { get; set; }
    public int Rejected { get; set; }
}
