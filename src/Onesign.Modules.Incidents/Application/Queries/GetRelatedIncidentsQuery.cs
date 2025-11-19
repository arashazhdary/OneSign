using MediatR;
using Onesign.Modules.Incidents.Application.DTOs;

namespace Onesign.Modules.Incidents.Application.Queries;

public class GetRelatedIncidentsQuery : IRequest<List<IncidentDto>>
{
    public Guid IncidentId { get; set; }
    public int MaxResults { get; set; } = 10;
    public bool IncludeSameUser { get; set; } = true;
    public bool IncludeSameApplication { get; set; } = true;
    public bool IncludeSameCategory { get; set; } = true;
    public TimeSpan TimeWindow { get; set; } = TimeSpan.FromDays(7);
}
