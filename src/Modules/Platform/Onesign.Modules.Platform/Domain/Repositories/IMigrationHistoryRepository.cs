using Onesign.Modules.Platform.Domain.Entities;
using Onesign.Modules.Platform.Domain.Enums;

namespace Onesign.Modules.Platform.Domain.Repositories;

public interface IMigrationHistoryRepository
{
    Task<MigrationHistory?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<MigrationHistory?> GetByNameAsync(string migrationName, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MigrationHistory>> GetAllAsync(int page, int pageSize, MigrationStatus? status, CancellationToken cancellationToken = default);
    Task<int> GetTotalCountAsync(MigrationStatus? status, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MigrationHistory>> GetPendingMigrationsAsync(CancellationToken cancellationToken = default);
    Task<MigrationHistory?> GetLatestMigrationAsync(CancellationToken cancellationToken = default);
    Task AddAsync(MigrationHistory migration, CancellationToken cancellationToken = default);
    Task UpdateAsync(MigrationHistory migration, CancellationToken cancellationToken = default);
}
