using Onesign.Modules.Privacy.Domain.Entities;
using Onesign.Modules.Privacy.Domain.Enums;

namespace Onesign.Modules.Privacy.Domain.Repositories;

public interface IDataRetentionPolicyRepository
{
    Task<DataRetentionPolicy?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<DataRetentionPolicy>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<DataRetentionPolicy?> GetByTenantAndCategoryAsync(Guid tenantId, DataCategory category, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<DataRetentionPolicy>> GetEnabledAsync(CancellationToken cancellationToken = default);
    Task AddAsync(DataRetentionPolicy policy, CancellationToken cancellationToken = default);
    Task UpdateAsync(DataRetentionPolicy policy, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
