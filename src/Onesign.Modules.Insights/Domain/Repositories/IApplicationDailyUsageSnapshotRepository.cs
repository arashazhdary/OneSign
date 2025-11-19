using Onesign.Modules.Insights.Domain.Entities;

namespace Onesign.Modules.Insights.Domain.Repositories;

public interface IApplicationDailyUsageSnapshotRepository
{
    Task<ApplicationDailyUsageSnapshot?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<ApplicationDailyUsageSnapshot?> GetByApplicationAndDateAsync(Guid tenantId, Guid applicationId, DateOnly date, CancellationToken ct = default);
    Task<IReadOnlyList<ApplicationDailyUsageSnapshot>> GetByTenantAndDateAsync(Guid tenantId, DateOnly date, CancellationToken ct = default);
    Task<IReadOnlyList<ApplicationDailyUsageSnapshot>> GetByApplicationAndDateRangeAsync(Guid tenantId, Guid applicationId, DateOnly from, DateOnly to, CancellationToken ct = default);
    Task<IReadOnlyList<ApplicationDailyUsageSnapshot>> GetTopApplicationsByUsageAsync(Guid tenantId, DateOnly date, int top, CancellationToken ct = default);
    Task AddAsync(ApplicationDailyUsageSnapshot snapshot, CancellationToken ct = default);
    Task UpdateAsync(ApplicationDailyUsageSnapshot snapshot, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
    Task DeleteOlderThanAsync(DateOnly date, CancellationToken ct = default);
}
