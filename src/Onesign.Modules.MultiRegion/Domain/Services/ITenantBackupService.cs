using Onesign.Modules.MultiRegion.Domain.Entities;

namespace Onesign.Modules.MultiRegion.Domain.Services;

public interface ITenantBackupService
{
    Task<TenantBackupSet> CreateBackupAsync(Guid tenantId, string backupType, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TenantBackupSet>> GetBackupsAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task RestoreAsync(Guid tenantId, Guid backupSetId, string? targetRegionId, CancellationToken cancellationToken = default);
}
