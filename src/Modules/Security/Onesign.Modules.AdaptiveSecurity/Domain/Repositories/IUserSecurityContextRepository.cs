using Onesign.Modules.AdaptiveSecurity.Domain.Entities;

namespace Onesign.Modules.AdaptiveSecurity.Domain.Repositories;

public interface IUserSecurityContextRepository
{
    Task<UserSecurityContext?> GetByUserIdAsync(Guid tenantId, Guid userId, CancellationToken ct = default);
    Task<IReadOnlyList<UserSecurityContext>> GetHighRiskUsersAsync(Guid tenantId, int minRiskScore, CancellationToken ct = default);
    Task AddAsync(UserSecurityContext context, CancellationToken ct = default);
    Task UpdateAsync(UserSecurityContext context, CancellationToken ct = default);
}
