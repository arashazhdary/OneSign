using Onesign.Modules.PrivilegedAccess.Domain.Entities;

namespace Onesign.Modules.PrivilegedAccess.Domain.Repositories;

public interface IBreakGlassAccountRepository
{
    Task<BreakGlassAccount?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<BreakGlassAccount?> GetByUsernameAsync(string username, CancellationToken ct = default);
    Task<IReadOnlyList<BreakGlassAccount>> GetAllAsync(CancellationToken ct = default);
    Task<IReadOnlyList<BreakGlassAccount>> GetEnabledAsync(CancellationToken ct = default);
    Task AddAsync(BreakGlassAccount account, CancellationToken ct = default);
    Task UpdateAsync(BreakGlassAccount account, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
