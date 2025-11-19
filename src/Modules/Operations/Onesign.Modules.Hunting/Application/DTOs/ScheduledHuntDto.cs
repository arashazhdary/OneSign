namespace Onesign.Modules.Hunting.Application.DTOs;

public class ScheduledHuntDto
{
    public Guid Id { get; set; }
    public string ScopeType { get; set; } = string.Empty;
    public Guid ScopeId { get; set; }
    public Guid SavedQueryId { get; set; }
    public string SavedQueryName { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string ScheduleSpec { get; set; } = string.Empty;
    public bool IsEnabled { get; set; }
    public int MinMatchCountForFinding { get; set; }
    public int MaxRowsToScan { get; set; }
    public int TimeWindowMinutes { get; set; }
    public HuntActionConfigDto? Actions { get; set; }
    public Guid CreatedByUserId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public Guid? UpdatedByUserId { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
    public int HuntRunsCount { get; set; }
    public DateTimeOffset? LastRunAt { get; set; }
    public string? LastRunStatus { get; set; }
}
