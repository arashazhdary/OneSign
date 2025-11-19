using Onesign.Modules.Incidents.Domain.Entities;

namespace Onesign.Modules.Incidents.Domain.Repositories;

public interface IIncidentEventRepository
{
    Task<IncidentEvent?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<IncidentEvent>> GetByIncidentAsync(Guid incidentId, CancellationToken ct = default);
    Task<IReadOnlyList<IncidentEvent>> GetByIncidentAndTypeAsync(Guid incidentId, string eventType, CancellationToken ct = default);
    Task<IReadOnlyList<IncidentEvent>> GetBySourceModuleAsync(Guid incidentId, string sourceModule, CancellationToken ct = default);
    Task<IReadOnlyList<IncidentEvent>> GetByDateRangeAsync(Guid incidentId, DateTime from, DateTime to, CancellationToken ct = default);
    Task AddAsync(IncidentEvent incidentEvent, CancellationToken ct = default);
    Task AddManyAsync(IEnumerable<IncidentEvent> events, CancellationToken ct = default);
    Task DeleteByIncidentAsync(Guid incidentId, CancellationToken ct = default);
}
