namespace Onesign.Modules.Security.Application.DTOs;

public class RiskEventDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public int EventType { get; set; }
    public int RiskLevel { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public string? Location { get; set; }
    public string? Details { get; set; }
    public DateTime OccurredAt { get; set; }
}
