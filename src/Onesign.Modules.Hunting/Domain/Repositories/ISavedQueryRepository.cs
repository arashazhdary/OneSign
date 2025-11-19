using Onesign.Modules.Hunting.Domain.Entities;
using Onesign.Modules.Hunting.Domain.Enums;

namespace Onesign.Modules.Hunting.Domain.Repositories;

public interface ISavedQueryRepository
{
    Task<SavedQuery?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<SavedQuery?> GetByIdWithScheduledHuntsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SavedQuery>> GetByScopeAsync(string scopeType, Guid scopeId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SavedQuery>> GetByDatasetAsync(string scopeType, Guid scopeId, HuntDataset dataset, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SavedQuery>> GetGlobalTemplatesAsync(CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<SavedQuery> Items, int TotalCount)> GetPagedAsync(
        string scopeType,
        Guid scopeId,
        HuntDataset? dataset,
        bool? isEnabled,
        string? searchTerm,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default);
    Task AddAsync(SavedQuery savedQuery, CancellationToken cancellationToken = default);
    Task UpdateAsync(SavedQuery savedQuery, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
