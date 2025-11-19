using MediatR;
using Onesign.Modules.Insights.Application.DTOs;

namespace Onesign.Modules.Insights.Application.Queries;

public class GetTenantInsightsOverviewQuery : IRequest<TenantInsightsOverviewDto?>
{
    public Guid TenantId { get; set; }
    public DateOnly From { get; set; }
    public DateOnly To { get; set; }
}
