using MediatR;
using Onesign.Modules.Insights.Application.DTOs;
using Onesign.Modules.Insights.Domain.Enums;

namespace Onesign.Modules.Insights.Application.Queries;

public class GetReportSubscriptionsQuery : IRequest<ReportSubscriptionListDto>
{
    public ScopeType? ScopeType { get; set; }
    public Guid? ScopeId { get; set; }
    public ReportType? ReportType { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public bool? IsActive { get; set; }
}
