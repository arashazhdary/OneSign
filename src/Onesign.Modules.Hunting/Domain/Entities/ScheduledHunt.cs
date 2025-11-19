using Onesign.Modules.Hunting.Domain.Enums;

namespace Onesign.Modules.Hunting.Domain.Entities;

public class ScheduledHunt
{
    public Guid Id { get; set; }
    public string ScopeType { get; set; } = string.Empty;
    public Guid ScopeId { get; set; }
    public Guid SavedQueryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public HuntScheduleSpec ScheduleSpec { get; set; }
    public bool IsEnabled { get; set; }
    public int MinMatchCountForFinding { get; set; }
    public int MaxRowsToScan { get; set; }
    public int TimeWindowMinutes { get; set; }
    public string? ActionsJson { get; set; }
    public Guid CreatedByUserId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public Guid? UpdatedByUserId { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }

    public SavedQuery? SavedQuery { get; set; }
    public List<HuntRun> HuntRuns { get; set; } = new();
}
