namespace Onesign.Modules.Incidents.Application.DTOs;

public class IncidentTimelineItemDto
{
    public Guid Id { get; set; }
    public DateTime Timestamp { get; set; }
    public string ItemType { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ActorUserId { get; set; }
    public string? Data { get; set; }
}
