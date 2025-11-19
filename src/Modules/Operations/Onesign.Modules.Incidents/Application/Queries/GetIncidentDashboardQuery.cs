using MediatR;
using Onesign.Modules.Incidents.Application.DTOs;

namespace Onesign.Modules.Incidents.Application.Queries;

public class GetIncidentDashboardQuery : IRequest<IncidentDashboardDto?>
{
    public Guid TenantId { get; set; }
}

public class IncidentDashboardDto
{
    public int TotalIncidents { get; set; }
    public int OpenIncidents { get; set; }
    public int ResolvedIncidents { get; set; }
    public int CriticalIncidents { get; set; }
    public double AverageResolutionTimeHours { get; set; }
    public List<IncidentTrendDto> Trends { get; set; } = new();
}

public class IncidentTrendDto
{
    public DateTime Date { get; set; }
    public int Count { get; set; }
}
