namespace Onesign.Modules.Incidents.Infrastructure.EfCore.Entities;

public class IncidentEventEntity
{
    public Guid Id { get; set; }
    public Guid IncidentId { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string EventData { get; set; } = "{}";
    public DateTime Timestamp { get; set; }
    public string SourceModule { get; set; } = string.Empty;
}
