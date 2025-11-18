using Onesign.Modules.MultiRegion.Domain.Entities;
using Onesign.Modules.MultiRegion.Domain.Enums;

namespace Onesign.Modules.MultiRegion.Domain.Repositories;

public interface IRegionBackupSetRepository
{
    Task<RegionBackupSet?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<RegionBackupSet>> GetByRegionIdAsync(string regionId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<RegionBackupSet>> GetByStatusAsync(BackupStatus status, CancellationToken cancellationToken = default);
    Task<RegionBackupSet?> GetLatestByRegionIdAsync(string regionId, CancellationToken cancellationToken = default);
    Task AddAsync(RegionBackupSet backupSet, CancellationToken cancellationToken = default);
    Task UpdateAsync(RegionBackupSet backupSet, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
