namespace Onesign.Modules.Hunting.Infrastructure.EfCore.Entities;

public class HuntRunEntity
{
    public Guid Id { get; set; }
    public Guid ScheduledHuntId { get; set; }
    public string ScopeType { get; set; } = string.Empty;
    public Guid ScopeId { get; set; }
    public DateTimeOffset StartedAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public int Status { get; set; }
    public int MatchCount { get; set; }
    public bool FindingCreated { get; set; }
    public Guid? IncidentId { get; set; }
    public Guid? TriggeredWorkflowId { get; set; }
    public string? ErrorMessage { get; set; }

    public ScheduledHuntEntity? ScheduledHunt { get; set; }
    public ICollection<HuntSampleRowEntity> SampleRows { get; set; } = new List<HuntSampleRowEntity>();
}
