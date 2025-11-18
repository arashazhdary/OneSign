using Onesign.Modules.AccountCenter.Domain.Entities;

namespace Onesign.Modules.AccountCenter.Domain.Repositories;

public interface IActiveSessionRepository
{
    Task<List<ActiveSession>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<ActiveSession?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ActiveSession> AddAsync(ActiveSession session, CancellationToken cancellationToken = default);
    Task UpdateAsync(ActiveSession session, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<int> DeleteExpiredAsync(CancellationToken cancellationToken = default);
}
