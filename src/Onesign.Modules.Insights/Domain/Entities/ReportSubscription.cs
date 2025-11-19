using Onesign.Modules.Insights.Domain.Enums;

namespace Onesign.Modules.Insights.Domain.Entities;

public class ReportSubscription
{
    public Guid Id { get; set; }
    public ScopeType ScopeType { get; set; }
    public Guid? ScopeId { get; set; }
    public ReportType ReportType { get; set; }
    public string CronOrFrequency { get; set; } = string.Empty;
    public string EmailRecipients { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid CreatedByUserId { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public Guid? UpdatedByUserId { get; set; }
    public DateTime? LastSentAt { get; set; }
}
