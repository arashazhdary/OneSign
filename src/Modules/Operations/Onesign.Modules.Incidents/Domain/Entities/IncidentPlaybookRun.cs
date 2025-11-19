namespace Onesign.Modules.Incidents.Domain.Entities;

public class IncidentPlaybookRun
{
    public Guid Id { get; set; }
    public Guid IncidentId { get; set; }
    public Guid WorkflowId { get; set; }
    public string WorkflowName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? Result { get; set; }
}
