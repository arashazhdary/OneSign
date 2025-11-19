namespace Onesign.Modules.Hunting.Application.DTOs;

public class HuntRunDto
{
    public Guid Id { get; set; }
    public Guid ScheduledHuntId { get; set; }
    public string ScheduledHuntName { get; set; } = string.Empty;
    public string ScopeType { get; set; } = string.Empty;
    public Guid ScopeId { get; set; }
    public DateTimeOffset StartedAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public string Status { get; set; } = string.Empty;
    public int MatchCount { get; set; }
    public bool FindingCreated { get; set; }
    public Guid? IncidentId { get; set; }
    public Guid? TriggeredWorkflowId { get; set; }
    public string? ErrorMessage { get; set; }
    public List<HuntSampleRowDto> SampleRows { get; set; } = new();
}

public class HuntSampleRowDto
{
    public Guid Id { get; set; }
    public int RowIndex { get; set; }
    public string Dataset { get; set; } = string.Empty;
    public string DocumentJson { get; set; } = string.Empty;
}
