using Onesign.Modules.Incidents.Domain.Entities;
using Onesign.Modules.Incidents.Domain.Enums;

namespace Onesign.Modules.Incidents.Domain.Repositories;

public interface IIncidentRepository
{
    Task<Incident?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<Incident>> GetByTenantAsync(Guid tenantId, int skip, int take, CancellationToken ct = default);
    Task<IReadOnlyList<Incident>> GetByStatusAsync(Guid tenantId, IncidentStatus status, CancellationToken ct = default);
    Task<IReadOnlyList<Incident>> GetBySeverityAsync(Guid tenantId, IncidentSeverity severity, CancellationToken ct = default);
    Task<IReadOnlyList<Incident>> GetByCategoryAsync(Guid tenantId, IncidentCategory category, CancellationToken ct = default);
    Task<IReadOnlyList<Incident>> GetByUserAsync(Guid tenantId, Guid userId, CancellationToken ct = default);
    Task<IReadOnlyList<Incident>> GetByApplicationAsync(Guid tenantId, Guid appId, CancellationToken ct = default);
    Task<IReadOnlyList<Incident>> GetByDateRangeAsync(Guid tenantId, DateTime from, DateTime to, CancellationToken ct = default);
    Task<IReadOnlyList<Incident>> GetActiveIncidentsAsync(Guid tenantId, CancellationToken ct = default);
    Task<int> GetCountByTenantAsync(Guid tenantId, CancellationToken ct = default);
    Task<int> GetCountByStatusAsync(Guid tenantId, IncidentStatus status, CancellationToken ct = default);
    Task AddAsync(Incident incident, CancellationToken ct = default);
    Task UpdateAsync(Incident incident, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
