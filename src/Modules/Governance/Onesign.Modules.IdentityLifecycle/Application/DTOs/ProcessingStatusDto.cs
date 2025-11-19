namespace Onesign.Modules.IdentityLifecycle.Application.DTOs;

public class ProcessingStatusDto
{
    public int TotalEvents { get; set; }
    public int PendingEvents { get; set; }
    public int ProcessedEvents { get; set; }
    public int FailedEvents { get; set; }
    public DateTime? LastProcessedAt { get; set; }
    public DateTime? NextScheduledRun { get; set; }
    public List<RecentEventDto> RecentEvents { get; set; } = new();
}

public class RecentEventDto
{
    public Guid EventId { get; set; }
    public string EventType { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? ProcessedAt { get; set; }
}
