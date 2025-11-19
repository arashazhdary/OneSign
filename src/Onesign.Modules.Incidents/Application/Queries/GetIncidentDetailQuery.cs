using MediatR;
using Onesign.Modules.Incidents.Application.DTOs;

namespace Onesign.Modules.Incidents.Application.Queries;

public class GetIncidentDetailQuery : IRequest<IncidentDetailDto?>
{
    public Guid Id { get; set; }
    public bool IncludeEvents { get; set; } = true;
    public bool IncludeEntities { get; set; } = true;
    public bool IncludeNotes { get; set; } = true;
    public bool IncludePlaybookRuns { get; set; } = true;
    public bool IncludeTimeline { get; set; } = true;
}
