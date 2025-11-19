namespace Onesign.Modules.Incidents.Application.DTOs;

public class IncidentNoteDto
{
    public Guid Id { get; set; }
    public Guid IncidentId { get; set; }
    public string Content { get; set; } = string.Empty;
    public Guid CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
