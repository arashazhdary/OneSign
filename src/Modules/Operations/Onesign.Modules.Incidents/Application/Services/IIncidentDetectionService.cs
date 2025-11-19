using Onesign.Modules.Incidents.Domain.Entities;

namespace Onesign.Modules.Incidents.Application.Services;

public interface IIncidentDetectionService
{
    Task<Incident?> DetectIncidentFromEventsAsync(Guid tenantId, IEnumerable<IncidentEvent> events, CancellationToken ct = default);
    Task<List<Incident>> ScanForIncidentsAsync(Guid tenantId, DateTime from, DateTime to, CancellationToken ct = default);
    Task<bool> ShouldCreateIncidentAsync(Guid tenantId, string eventType, string eventData, CancellationToken ct = default);
}
