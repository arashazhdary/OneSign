using Onesign.Modules.AdaptiveSecurity.Domain.Entities;
using Onesign.Modules.AdaptiveSecurity.Domain.Enums;

namespace Onesign.Modules.AdaptiveSecurity.Domain.Repositories;

public interface ISecuritySignalRepository
{
    Task<SecuritySignal?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<SecuritySignal>> GetByTenantAsync(Guid tenantId, int limit = 100, CancellationToken ct = default);
    Task<IReadOnlyList<SecuritySignal>> GetByUserAsync(Guid tenantId, Guid userId, CancellationToken ct = default);
    Task<IReadOnlyList<SecuritySignal>> GetRecentSignalsAsync(Guid tenantId, Guid userId, TimeSpan window, CancellationToken ct = default);
    Task<IReadOnlyList<SecuritySignal>> GetByTypeAsync(Guid tenantId, SecuritySignalType signalType, CancellationToken ct = default);
    Task<IReadOnlyList<SecuritySignal>> GetUnprocessedAsync(Guid tenantId, CancellationToken ct = default);
    Task AddAsync(SecuritySignal signal, CancellationToken ct = default);
    Task UpdateAsync(SecuritySignal signal, CancellationToken ct = default);
}
