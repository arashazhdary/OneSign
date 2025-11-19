using Onesign.Modules.IdentityLifecycle.Domain.Entities;
using Onesign.Modules.IdentityLifecycle.Domain.Enums;

namespace Onesign.Modules.IdentityLifecycle.Domain.Repositories;

public interface ILifecycleEventRepository
{
    Task<LifecycleEvent?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<LifecycleEvent>> GetByHRRecordIdAsync(Guid hrRecordId, CancellationToken ct = default);
    Task<IReadOnlyList<LifecycleEvent>> GetByStatusAsync(Guid tenantId, ProcessingStatus status, CancellationToken ct = default);
    Task<IReadOnlyList<LifecycleEvent>> GetPendingEventsAsync(Guid tenantId, int limit = 100, CancellationToken ct = default);
    Task AddAsync(LifecycleEvent lifecycleEvent, CancellationToken ct = default);
    Task UpdateAsync(LifecycleEvent lifecycleEvent, CancellationToken ct = default);
}
