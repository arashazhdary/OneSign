using Onesign.Modules.IdentityLifecycle.Domain.Entities;

namespace Onesign.Modules.IdentityLifecycle.Domain.Repositories;

public interface IHRIdentityRecordRepository
{
    Task<HRIdentityRecord?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<HRIdentityRecord?> GetByExternalIdAsync(Guid tenantId, string externalEmployeeId, CancellationToken ct = default);
    Task<IReadOnlyList<HRIdentityRecord>> GetByTenantAsync(Guid tenantId, CancellationToken ct = default);
    Task AddAsync(HRIdentityRecord record, CancellationToken ct = default);
    Task UpdateAsync(HRIdentityRecord record, CancellationToken ct = default);
}
