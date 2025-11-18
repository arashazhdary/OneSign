using Onesign.Modules.IdentityInsights.Domain.Entities;

namespace Onesign.Modules.IdentityInsights.Domain.Services;

public interface IUserRiskScoringService
{
    Task<UserRiskProfile> CalculateRiskAsync(Guid tenantId, Guid userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<UserRiskProfile>> GetHighRiskUsersAsync(Guid tenantId, int threshold, CancellationToken cancellationToken = default);
}
