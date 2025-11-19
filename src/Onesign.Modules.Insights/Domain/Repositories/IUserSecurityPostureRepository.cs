using Onesign.Modules.Insights.Domain.Entities;

namespace Onesign.Modules.Insights.Domain.Repositories;

public interface IUserSecurityPostureRepository
{
    Task<UserSecurityPosture?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<UserSecurityPosture?> GetByUserIdAsync(Guid tenantId, Guid userId, CancellationToken ct = default);
    Task<IReadOnlyList<UserSecurityPosture>> GetByTenantIdAsync(Guid tenantId, CancellationToken ct = default);
    Task<IReadOnlyList<UserSecurityPosture>> GetByTenantIdPagedAsync(Guid tenantId, int skip, int take, CancellationToken ct = default);
    Task<IReadOnlyList<UserSecurityPosture>> GetHighRiskUsersAsync(Guid tenantId, int minHighRiskEvents, int take, CancellationToken ct = default);
    Task<IReadOnlyList<UserSecurityPosture>> GetUsersWithoutMfaAsync(Guid tenantId, int take, CancellationToken ct = default);
    Task<IReadOnlyList<UserSecurityPosture>> GetInactiveUsersAsync(Guid tenantId, int daysInactive, int take, CancellationToken ct = default);
    Task<int> GetTotalCountAsync(Guid tenantId, CancellationToken ct = default);
    Task AddAsync(UserSecurityPosture posture, CancellationToken ct = default);
    Task UpdateAsync(UserSecurityPosture posture, CancellationToken ct = default);
    Task UpsertAsync(UserSecurityPosture posture, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
    Task DeleteByUserIdAsync(Guid tenantId, Guid userId, CancellationToken ct = default);
}
