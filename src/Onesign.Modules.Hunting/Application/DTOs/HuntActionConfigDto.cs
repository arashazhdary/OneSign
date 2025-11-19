namespace Onesign.Modules.Hunting.Application.DTOs;

public class HuntActionConfigDto
{
    public bool CreateIncident { get; set; }
    public string? IncidentSeverity { get; set; }
    public string? IncidentTitle { get; set; }
    public Guid? TriggerWorkflowId { get; set; }
    public List<string>? NotifyEmails { get; set; }
    public string? NotificationMessage { get; set; }
    public bool CreateFinding { get; set; }
    public string? FindingCategory { get; set; }
}
