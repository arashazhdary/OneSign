using MediatR;
using Onesign.Modules.Insights.Application.DTOs;

namespace Onesign.Modules.Insights.Application.Queries;

public class GetDashboardStatsQuery : IRequest<DashboardStatsDto>
{
    public int TrendDays { get; set; } = 7;
    public int TopTenantsCount { get; set; } = 5;
    public int RecentEventsCount { get; set; } = 10;
}
