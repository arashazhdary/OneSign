namespace Onesign.Modules.Security.Application.DTOs;

public class RiskEventFilterRequest
{
    public Guid? UserId { get; set; }
    public int? EventType { get; set; }
    public int? RiskLevel { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
