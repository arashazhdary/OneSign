using Onesign.Modules.IdentityInsights.Domain.Entities;

namespace Onesign.Modules.IdentityInsights.Domain.Repositories;

public interface IUserRiskProfileRepository
{
    Task<UserRiskProfile?> GetByUserIdAsync(Guid tenantId, Guid userId, CancellationToken ct = default);
    Task<IReadOnlyList<UserRiskProfile>> GetHighRiskUsersAsync(Guid tenantId, int minRiskScore, CancellationToken ct = default);
    Task AddAsync(UserRiskProfile profile, CancellationToken ct = default);
    Task UpdateAsync(UserRiskProfile profile, CancellationToken ct = default);
}
