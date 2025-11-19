using Onesign.Modules.PrivilegedAccess.Domain.Entities;
using Onesign.Modules.PrivilegedAccess.Domain.Enums;

namespace Onesign.Modules.PrivilegedAccess.Domain.Repositories;

public interface IJitGrantRepository
{
    Task<JitGrant?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<JitGrant>> GetByUserAsync(Guid tenantId, Guid userId, CancellationToken ct = default);
    Task<IReadOnlyList<JitGrant>> GetByTenantIdAsync(Guid tenantId, CancellationToken ct = default);
    Task<IReadOnlyList<JitGrant>> GetActiveByUserAsync(Guid tenantId, Guid userId, CancellationToken ct = default);
    Task<IReadOnlyList<JitGrant>> GetActiveGrantsForUserAsync(Guid tenantId, Guid userId, CancellationToken ct = default);
    Task<IReadOnlyList<JitGrant>> GetExpiredGrantsAsync(CancellationToken ct = default);
    Task<IReadOnlyList<JitGrant>> GetExpiredGrantsAsync(DateTime beforeDate, CancellationToken ct = default);
    Task AddAsync(JitGrant grant, CancellationToken ct = default);
    Task UpdateAsync(JitGrant grant, CancellationToken ct = default);
}
