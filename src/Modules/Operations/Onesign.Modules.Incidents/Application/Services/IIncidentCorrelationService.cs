using Onesign.Modules.Incidents.Domain.Entities;

namespace Onesign.Modules.Incidents.Application.Services;

public interface IIncidentCorrelationService
{
    Task<List<Incident>> FindRelatedIncidentsAsync(Incident incident, TimeSpan timeWindow, bool includeSameUser, bool includeSameApplication, bool includeSameCategory, CancellationToken ct = default);
    Task<List<IncidentEvent>> CorrelateEventsAsync(Guid tenantId, IEnumerable<IncidentEvent> events, CancellationToken ct = default);
    Task<double> CalculateCorrelationScoreAsync(Incident incident1, Incident incident2, CancellationToken ct = default);
}
