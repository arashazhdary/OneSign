namespace Onesign.Modules.Incidents.Infrastructure.EfCore.Entities;

public class IncidentPlaybookRunEntity
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
