using Onesign.Modules.Billing.Domain.Entities;
using Onesign.Modules.Billing.Domain.Enums;

namespace Onesign.Modules.Billing.Domain.Repositories;

public interface IUsageRepository
{
    Task<UsageCounter?> GetCounterAsync(Guid tenantId, UsageMetricType metricType, int year, int month, CancellationToken cancellationToken = default);
    Task<List<UsageCounter>> GetCountersForTenantAsync(Guid tenantId, int? year = null, int? month = null, CancellationToken cancellationToken = default);
    Task<UsageCounter> UpsertCounterAsync(UsageCounter counter, CancellationToken cancellationToken = default);

    Task<TenantUsageSnapshot?> GetLatestSnapshotAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<List<TenantUsageSnapshot>> GetSnapshotsAsync(Guid tenantId, DateTime? from = null, DateTime? to = null, CancellationToken cancellationToken = default);
    Task<TenantUsageSnapshot> AddSnapshotAsync(TenantUsageSnapshot snapshot, CancellationToken cancellationToken = default);
}
