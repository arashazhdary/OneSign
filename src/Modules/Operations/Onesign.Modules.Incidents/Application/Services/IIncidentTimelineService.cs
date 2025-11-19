using Onesign.Modules.Incidents.Application.DTOs;

namespace Onesign.Modules.Incidents.Application.Services;

public interface IIncidentTimelineService
{
    Task<List<IncidentTimelineItemDto>> BuildTimelineAsync(Guid incidentId, CancellationToken ct = default);
    Task<List<IncidentTimelineItemDto>> BuildTimelineAsync(Guid incidentId, DateTime from, DateTime to, CancellationToken ct = default);
}
