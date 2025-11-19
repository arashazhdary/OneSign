using Onesign.Modules.Insights.Domain.Enums;

namespace Onesign.Modules.Insights.Application.DTOs;

public class ReportSubscriptionDto
{
    public Guid Id { get; set; }
    public ScopeType ScopeType { get; set; }
    public Guid? ScopeId { get; set; }
    public ReportType ReportType { get; set; }
    public string CronOrFrequency { get; set; } = string.Empty;
    public List<string> EmailRecipients { get; set; } = new();
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid CreatedByUserId { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public Guid? UpdatedByUserId { get; set; }
}

public class ReportSubscriptionListDto
{
    public List<ReportSubscriptionDto> Subscriptions { get; set; } = new();
    public int TotalCount { get; set; }
}
