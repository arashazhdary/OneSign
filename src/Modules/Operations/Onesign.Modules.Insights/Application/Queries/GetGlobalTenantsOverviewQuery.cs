using MediatR;
using Onesign.Modules.Insights.Application.DTOs;

namespace Onesign.Modules.Insights.Application.Queries;

public class GetGlobalTenantsOverviewQuery : IRequest<GlobalTenantOverviewDto>
{
    public DateOnly? Date { get; set; }
    public int Days { get; set; } = 1;
}
