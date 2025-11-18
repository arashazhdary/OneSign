using Onesign.Modules.IdentityInsights.Domain.Entities;
using Onesign.Modules.IdentityInsights.Domain.Enums;

namespace Onesign.Modules.IdentityInsights.Domain.Repositories;

public interface IInsightRepository
{
    Task<Insight?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<Insight>> GetByTenantIdAsync(Guid tenantId, CancellationToken ct = default);
    Task<IReadOnlyList<Insight>> GetByTenantAndStatusAsync(Guid tenantId, InsightStatus status, CancellationToken ct = default);
    Task<IReadOnlyList<Insight>> GetBySeverityAsync(Guid tenantId, InsightSeverity severity, CancellationToken ct = default);
    Task<IReadOnlyList<Insight>> GetByScopeAsync(Guid tenantId, string scopeType, Guid? scopeId, CancellationToken ct = default);
    Task AddAsync(Insight insight, CancellationToken ct = default);
    Task UpdateAsync(Insight insight, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
