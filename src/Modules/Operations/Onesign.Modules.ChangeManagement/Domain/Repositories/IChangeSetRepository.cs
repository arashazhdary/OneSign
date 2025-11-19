using Onesign.Modules.ChangeManagement.Domain.Entities;
using Onesign.Modules.ChangeManagement.Domain.Enums;

namespace Onesign.Modules.ChangeManagement.Domain.Repositories;

public interface IChangeSetRepository
{
    Task<ChangeSet?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ChangeSet?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ChangeSet>> GetByScopeAsync(string scopeType, Guid scopeId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ChangeSet>> GetByStatusAsync(string scopeType, Guid scopeId, ChangeSetStatus status, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ChangeSet>> GetPendingApprovalsForUserAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<ChangeSet> Items, int TotalCount)> GetPagedAsync(
        string scopeType,
        Guid scopeId,
        ChangeSetStatus? status,
        ChangeCategory? category,
        Guid? requestedByUserId,
        DateTimeOffset? fromDate,
        DateTimeOffset? toDate,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default);
    Task AddAsync(ChangeSet changeSet, CancellationToken cancellationToken = default);
    Task UpdateAsync(ChangeSet changeSet, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
