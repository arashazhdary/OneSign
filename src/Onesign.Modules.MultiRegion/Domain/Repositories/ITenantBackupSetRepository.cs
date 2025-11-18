using Onesign.Modules.MultiRegion.Domain.Entities;
using Onesign.Modules.MultiRegion.Domain.Enums;

namespace Onesign.Modules.MultiRegion.Domain.Repositories;

public interface ITenantBackupSetRepository
{
    Task<TenantBackupSet?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TenantBackupSet>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TenantBackupSet>> GetByStatusAsync(BackupStatus status, CancellationToken cancellationToken = default);
    Task<TenantBackupSet?> GetLatestByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task AddAsync(TenantBackupSet backupSet, CancellationToken cancellationToken = default);
    Task UpdateAsync(TenantBackupSet backupSet, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
