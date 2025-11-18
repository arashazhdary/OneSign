using Onesign.Modules.IdentityInsights.Domain.Entities;

namespace Onesign.Modules.IdentityInsights.Domain.Services;

public interface IRiskScoringService
{
    Task<UserRiskProfile> CalculateUserRiskAsync(Guid tenantId, Guid userId, CancellationToken cancellationToken = default);
    Task<TenantRiskProfile> CalculateTenantRiskAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<UserRiskProfile>> GetHighRiskUsersAsync(Guid tenantId, int threshold = 70, int limit = 100, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<UserRiskProfile>> GetZombieAccountsAsync(Guid tenantId, int inactiveDays = 90, CancellationToken cancellationToken = default);
    Task RecalculateAllUsersAsync(Guid tenantId, CancellationToken cancellationToken = default);
}
