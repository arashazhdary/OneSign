using Onesign.Modules.Incidents.Domain.Entities;

namespace Onesign.Modules.Incidents.Domain.Repositories;

public interface IIncidentNoteRepository
{
    Task<IncidentNote?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<IncidentNote>> GetByIncidentAsync(Guid incidentId, CancellationToken ct = default);
    Task<IReadOnlyList<IncidentNote>> GetByUserAsync(Guid incidentId, Guid userId, CancellationToken ct = default);
    Task AddAsync(IncidentNote note, CancellationToken ct = default);
    Task UpdateAsync(IncidentNote note, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
    Task DeleteByIncidentAsync(Guid incidentId, CancellationToken ct = default);
}
