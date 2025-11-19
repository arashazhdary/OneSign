namespace Onesign.Modules.Hunting.Application.DTOs;

public class SavedQueryDto
{
    public Guid Id { get; set; }
    public string ScopeType { get; set; } = string.Empty;
    public Guid ScopeId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Dataset { get; set; } = string.Empty;
    public string QueryDslJson { get; set; } = string.Empty;
    public bool IsGlobalTemplate { get; set; }
    public bool IsEnabled { get; set; }
    public Guid CreatedByUserId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public Guid? UpdatedByUserId { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
    public int ScheduledHuntsCount { get; set; }
}
