using Onesign.Modules.Insights.Domain.Entities;

namespace Onesign.Modules.Insights.Domain.Repositories;

public interface ITenantDailyUsageSnapshotRepository
{
    Task<TenantDailyUsageSnapshot?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<TenantDailyUsageSnapshot?> GetByTenantAndDateAsync(Guid tenantId, DateOnly date, CancellationToken ct = default);
    Task<IReadOnlyList<TenantDailyUsageSnapshot>> GetByTenantAndDateRangeAsync(Guid tenantId, DateOnly from, DateOnly to, CancellationToken ct = default);
    Task<IReadOnlyList<TenantDailyUsageSnapshot>> GetAllByDateAsync(DateOnly date, CancellationToken ct = default);
    Task<IReadOnlyList<TenantDailyUsageSnapshot>> GetLatestByTenantsAsync(int days, CancellationToken ct = default);
    Task AddAsync(TenantDailyUsageSnapshot snapshot, CancellationToken ct = default);
    Task UpdateAsync(TenantDailyUsageSnapshot snapshot, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
    Task DeleteOlderThanAsync(DateOnly date, CancellationToken ct = default);
}
