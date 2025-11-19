using MediatR;
using Onesign.Modules.Incidents.Application.DTOs;

namespace Onesign.Modules.Incidents.Application.Queries;

public class GetIncidentTimelineQuery : IRequest<List<IncidentTimelineItemDto>>
{
    public Guid IncidentId { get; set; }
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
    public int? Limit { get; set; }
}
