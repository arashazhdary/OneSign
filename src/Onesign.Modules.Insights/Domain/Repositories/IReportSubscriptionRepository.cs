using Onesign.Modules.Insights.Domain.Entities;
using Onesign.Modules.Insights.Domain.Enums;

namespace Onesign.Modules.Insights.Domain.Repositories;

public interface IReportSubscriptionRepository
{
    Task<ReportSubscription?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<ReportSubscription>> GetByScopeAsync(ScopeType scopeType, Guid? scopeId, CancellationToken ct = default);
    Task<IReadOnlyList<ReportSubscription>> GetActiveSubscriptionsAsync(CancellationToken ct = default);
    Task<IReadOnlyList<ReportSubscription>> GetByReportTypeAsync(ReportType reportType, CancellationToken ct = default);
    Task<IReadOnlyList<ReportSubscription>> GetByCreatedByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task AddAsync(ReportSubscription subscription, CancellationToken ct = default);
    Task UpdateAsync(ReportSubscription subscription, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
