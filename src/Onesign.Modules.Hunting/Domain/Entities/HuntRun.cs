using Onesign.Modules.Hunting.Domain.Enums;

namespace Onesign.Modules.Hunting.Domain.Entities;

public class HuntRun
{
    public Guid Id { get; set; }
    public Guid ScheduledHuntId { get; set; }
    public string ScopeType { get; set; } = string.Empty;
    public Guid ScopeId { get; set; }
    public DateTimeOffset StartedAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public HuntRunStatus Status { get; set; }
    public int MatchCount { get; set; }
    public bool FindingCreated { get; set; }
    public Guid? IncidentId { get; set; }
    public Guid? TriggeredWorkflowId { get; set; }
    public string? ErrorMessage { get; set; }

    public ScheduledHunt? ScheduledHunt { get; set; }
    public List<HuntSampleRow> SampleRows { get; set; } = new();
}
