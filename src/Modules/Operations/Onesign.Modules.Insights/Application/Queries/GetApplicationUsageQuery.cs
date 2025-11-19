using MediatR;
using Onesign.Modules.Insights.Application.DTOs;

namespace Onesign.Modules.Insights.Application.Queries;

public class GetApplicationUsageQuery : IRequest<ApplicationUsageListDto?>
{
    public Guid TenantId { get; set; }
    public DateOnly Date { get; set; }
}
