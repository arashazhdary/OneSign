using Onesign.Modules.Platform.Application.DTOs;

namespace Onesign.Modules.Platform.Application.Services;

public interface IMigrationService
{
    Task<MigrationHistoryDto> ApplyMigrationAsync(string migrationName, Guid userId, CancellationToken cancellationToken = default);
    Task<List<MigrationHistoryDto>> GetPendingMigrationsAsync(CancellationToken cancellationToken = default);
    Task<MigrationHistoryDto?> GetLatestMigrationAsync(CancellationToken cancellationToken = default);
    Task<bool> IsMigrationAppliedAsync(string migrationName, CancellationToken cancellationToken = default);
}
