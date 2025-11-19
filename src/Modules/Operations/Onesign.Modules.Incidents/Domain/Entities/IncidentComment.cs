namespace Onesign.Modules.Incidents.Domain.Entities;

public class IncidentComment
{
    public Guid Id { get; set; }
    public Guid IncidentId { get; set; }
    public Guid UserId { get; set; }
    public string Text { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
