using Onesign.Modules.Identity.Domain.Entities;

namespace Onesign.Modules.Identity.Domain.Repositories;

public interface IUserLoginSessionRepository
{
    Task<UserLoginSession?> GetByTokenAsync(string token, CancellationToken cancellationToken = default);
    Task<UserLoginSession?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<UserLoginSession>> GetByTenantUserIdAsync(Guid tenantUserId, CancellationToken cancellationToken = default);
    Task<UserLoginSession> AddAsync(UserLoginSession session, CancellationToken cancellationToken = default);
    Task UpdateAsync(UserLoginSession session, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task DeleteByTenantUserIdAsync(Guid tenantUserId, Guid currentSessionId, CancellationToken cancellationToken = default);
    Task DeleteExpiredAsync(CancellationToken cancellationToken = default);
}

