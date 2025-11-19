using Onesign.Modules.Hunting.Domain.Entities;
using Onesign.Modules.Hunting.Domain.Enums;

namespace Onesign.Modules.Hunting.Domain.Repositories;

public interface IScheduledHuntRepository
{
    Task<ScheduledHunt?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ScheduledHunt?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ScheduledHunt>> GetByScopeAsync(string scopeType, Guid scopeId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ScheduledHunt>> GetBySavedQueryIdAsync(Guid savedQueryId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ScheduledHunt>> GetEnabledByScheduleSpecAsync(HuntScheduleSpec scheduleSpec, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ScheduledHunt>> GetAllEnabledAsync(CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<ScheduledHunt> Items, int TotalCount)> GetPagedAsync(
        string scopeType,
        Guid scopeId,
        HuntScheduleSpec? scheduleSpec,
        bool? isEnabled,
        Guid? savedQueryId,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default);
    Task AddAsync(ScheduledHunt scheduledHunt, CancellationToken cancellationToken = default);
    Task UpdateAsync(ScheduledHunt scheduledHunt, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
