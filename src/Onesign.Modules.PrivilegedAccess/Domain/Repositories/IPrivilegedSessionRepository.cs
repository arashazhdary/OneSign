using Onesign.Modules.PrivilegedAccess.Domain.Entities;

namespace Onesign.Modules.PrivilegedAccess.Domain.Repositories;

public interface IPrivilegedSessionRepository
{
    Task<PrivilegedSession?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<PrivilegedSession>> GetByUserAsync(Guid tenantId, Guid userId, CancellationToken ct = default);
    Task<IReadOnlyList<PrivilegedSession>> GetActiveSessionsAsync(Guid tenantId, CancellationToken ct = default);
    Task<PrivilegedSession?> GetActiveSessionByUserAsync(Guid tenantId, Guid userId, CancellationToken ct = default);
    Task AddAsync(PrivilegedSession session, CancellationToken ct = default);
    Task UpdateAsync(PrivilegedSession session, CancellationToken ct = default);
}
