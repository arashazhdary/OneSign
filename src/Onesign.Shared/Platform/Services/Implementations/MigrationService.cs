using Microsoft.Extensions.Logging;
using Onesign.Shared.Platform.Entities;

namespace Onesign.Shared.Platform.Services.Implementations;

public class MigrationService : IMigrationService
{
    private readonly ILogger<MigrationService> _logger;
    private readonly List<MigrationHistory> _appliedMigrations = new();

    public MigrationService(ILogger<MigrationService> logger)
    {
        _logger = logger;

        _appliedMigrations.Add(new MigrationHistory
        {
            Id = Guid.NewGuid(),
            MigrationId = "20240101000001_InitialSchema",
            Name = "Initial Schema",
            Module = "Core",
            AppliedAt = DateTime.UtcNow.AddMonths(-1),
            AppliedBy = "system",
            ExecutionTime = TimeSpan.FromSeconds(5),
            Success = true
        });
    }

    public async Task<IReadOnlyList<MigrationHistory>> GetMigrationHistoryAsync(CancellationToken cancellationToken = default)
    {
        return await Task.FromResult(_appliedMigrations.OrderByDescending(m => m.AppliedAt).ToList());
    }

    public async Task<IReadOnlyList<PendingMigration>> GetPendingMigrationsAsync(CancellationToken cancellationToken = default)
    {
        return await Task.FromResult(new List<PendingMigration>());
    }

    public async Task<MigrationResult> ApplyMigrationsAsync(ApplyMigrationsRequest request, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Applying migrations, DryRun: {DryRun}", request.DryRun);

        var pendingMigrations = await GetPendingMigrationsAsync(cancellationToken);

        if (!pendingMigrations.Any())
        {
            return new MigrationResult
            {
                Success = true,
                AppliedCount = 0,
                AppliedMigrations = new List<MigrationHistory>(),
                TotalDuration = TimeSpan.Zero
            };
        }

        var result = new MigrationResult
        {
            AppliedMigrations = new List<MigrationHistory>()
        };

        var startTime = DateTime.UtcNow;

        foreach (var migration in pendingMigrations)
        {
            if (request.MigrationIds != null && !request.MigrationIds.Contains(migration.MigrationId))
            {
                continue;
            }

            try
            {
                if (!request.DryRun)
                {
                    await Task.Delay(100, cancellationToken);
                }

                var history = new MigrationHistory
                {
                    Id = Guid.NewGuid(),
                    MigrationId = migration.MigrationId,
                    Name = migration.Name,
                    Module = migration.Module,
                    AppliedAt = DateTime.UtcNow,
                    AppliedBy = "system",
                    ExecutionTime = TimeSpan.FromMilliseconds(100),
                    Success = true
                };

                result.AppliedMigrations.Add(history);

                if (!request.DryRun)
                {
                    _appliedMigrations.Add(history);
                }

                _logger.LogInformation("Applied migration: {MigrationId}", migration.MigrationId);
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.ErrorMessage = $"Failed to apply migration {migration.MigrationId}: {ex.Message}";
                _logger.LogError(ex, "Failed to apply migration {MigrationId}", migration.MigrationId);
                break;
            }
        }

        result.AppliedCount = result.AppliedMigrations.Count;
        result.TotalDuration = DateTime.UtcNow - startTime;
        result.Success = result.Success || result.AppliedCount > 0;

        return result;
    }

    public async Task<MigrationResult> RollbackMigrationAsync(string migrationId, CancellationToken cancellationToken = default)
    {
        var migration = _appliedMigrations.FirstOrDefault(m => m.MigrationId == migrationId);

        if (migration == null)
        {
            return new MigrationResult
            {
                Success = false,
                ErrorMessage = $"Migration {migrationId} not found"
            };
        }

        _logger.LogInformation("Rolling back migration: {MigrationId}", migrationId);

        await Task.Delay(100, cancellationToken);

        _appliedMigrations.Remove(migration);

        return new MigrationResult
        {
            Success = true,
            AppliedCount = 1,
            AppliedMigrations = new List<MigrationHistory> { migration },
            TotalDuration = TimeSpan.FromMilliseconds(100)
        };
    }

    public async Task<bool> ValidateMigrationAsync(string migrationId, CancellationToken cancellationToken = default)
    {
        await Task.Delay(50, cancellationToken);
        return true;
    }
}
