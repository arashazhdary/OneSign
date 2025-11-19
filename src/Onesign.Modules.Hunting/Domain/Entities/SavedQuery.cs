using Onesign.Modules.Hunting.Domain.Enums;

namespace Onesign.Modules.Hunting.Domain.Entities;

public class SavedQuery
{
    public Guid Id { get; set; }
    public string ScopeType { get; set; } = string.Empty;
    public Guid ScopeId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public HuntDataset Dataset { get; set; }
    public string QueryDslJson { get; set; } = string.Empty;
    public bool IsGlobalTemplate { get; set; }
    public bool IsEnabled { get; set; }
    public Guid CreatedByUserId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public Guid? UpdatedByUserId { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }

    public List<ScheduledHunt> ScheduledHunts { get; set; } = new();
}
