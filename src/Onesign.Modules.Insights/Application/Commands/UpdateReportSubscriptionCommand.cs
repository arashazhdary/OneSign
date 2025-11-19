using MediatR;
using Onesign.Modules.Insights.Application.DTOs;
using Onesign.Modules.Insights.Domain.Enums;

namespace Onesign.Modules.Insights.Application.Commands;

public class UpdateReportSubscriptionCommand : IRequest<ReportSubscriptionDto?>
{
    public Guid Id { get; set; }
    public ScopeType ScopeType { get; set; }
    public Guid? ScopeId { get; set; }
    public ReportType ReportType { get; set; }
    public string CronOrFrequency { get; set; } = string.Empty;
    public List<string> EmailRecipients { get; set; } = new();
    public bool IsActive { get; set; }
    public Guid UpdatedByUserId { get; set; }
}
