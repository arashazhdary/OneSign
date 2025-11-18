using Onesign.Shared.Platform.Entities;

namespace Onesign.Shared.Platform.Services;

public interface IMigrationService
{
    Task<IReadOnlyList<MigrationHistory>> GetMigrationHistoryAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PendingMigration>> GetPendingMigrationsAsync(CancellationToken cancellationToken = default);
    Task<MigrationResult> ApplyMigrationsAsync(ApplyMigrationsRequest request, CancellationToken cancellationToken = default);
    Task<MigrationResult> RollbackMigrationAsync(string migrationId, CancellationToken cancellationToken = default);
    Task<bool> ValidateMigrationAsync(string migrationId, CancellationToken cancellationToken = default);
}

public class PendingMigration
{
    public string MigrationId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Module { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool RequiresDowntime { get; set; }
    public TimeSpan EstimatedDuration { get; set; }
}

public class ApplyMigrationsRequest
{
    public List<string>? MigrationIds { get; set; }
    public bool ApplyAll { get; set; } = true;
    public bool DryRun { get; set; } = false;
    public int? TimeoutSeconds { get; set; }
}

public class MigrationResult
{
    public bool Success { get; set; }
    public int AppliedCount { get; set; }
    public List<MigrationHistory> AppliedMigrations { get; set; } = new();
    public string? ErrorMessage { get; set; }
    public TimeSpan TotalDuration { get; set; }
}
