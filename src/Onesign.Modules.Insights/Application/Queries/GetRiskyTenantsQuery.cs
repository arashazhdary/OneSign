using MediatR;
using Onesign.Modules.Insights.Application.DTOs;

namespace Onesign.Modules.Insights.Application.Queries;

public class GetRiskyTenantsQuery : IRequest<RiskyTenantsListDto>
{
    public int Days { get; set; } = 30;
    public int MinRiskScore { get; set; } = 50;
    public int Top { get; set; } = 100;
}
