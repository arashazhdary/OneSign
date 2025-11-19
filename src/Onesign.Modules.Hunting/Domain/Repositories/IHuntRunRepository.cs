using Onesign.Modules.Hunting.Domain.Entities;
using Onesign.Modules.Hunting.Domain.Enums;

namespace Onesign.Modules.Hunting.Domain.Repositories;

public interface IHuntRunRepository
{
    Task<HuntRun?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<HuntRun?> GetByIdWithSampleRowsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<HuntRun>> GetByScheduledHuntIdAsync(Guid scheduledHuntId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<HuntRun>> GetByScopeAsync(string scopeType, Guid scopeId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<HuntRun>> GetByStatusAsync(HuntRunStatus status, CancellationToken cancellationToken = default);
    Task<HuntRun?> GetLatestByScheduledHuntIdAsync(Guid scheduledHuntId, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<HuntRun> Items, int TotalCount)> GetPagedAsync(
        string scopeType,
        Guid scopeId,
        Guid? scheduledHuntId,
        HuntRunStatus? status,
        DateTimeOffset? fromDate,
        DateTimeOffset? toDate,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default);
    Task AddAsync(HuntRun huntRun, CancellationToken cancellationToken = default);
    Task UpdateAsync(HuntRun huntRun, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
