using MediatR;
using Onesign.Modules.Incidents.Application.DTOs;

namespace Onesign.Modules.Incidents.Application.Queries;

public class GetIncidentStatisticsQuery : IRequest<IncidentStatisticsDto>
{
    public Guid TenantId { get; set; }
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
    public int TrendDays { get; set; } = 30;
}
