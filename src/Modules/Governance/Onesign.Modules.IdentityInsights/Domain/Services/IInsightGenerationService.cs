using Onesign.Modules.IdentityInsights.Domain.Entities;

namespace Onesign.Modules.IdentityInsights.Domain.Services;

public interface IInsightGenerationService
{
    Task GenerateInsightsForTenantAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Insight>> GetOpenInsightsAsync(Guid tenantId, CancellationToken cancellationToken = default);
}
