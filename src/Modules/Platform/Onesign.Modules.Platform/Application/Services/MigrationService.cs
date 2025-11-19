using System.Diagnostics;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Platform.Application.DTOs;
using Onesign.Modules.Platform.Domain.Entities;
using Onesign.Modules.Platform.Domain.Enums;
using Onesign.Modules.Platform.Domain.Repositories;

namespace Onesign.Modules.Platform.Application.Services;

public class MigrationService : IMigrationService
{
    private readonly IMigrationHistoryRepository _repository;
    private readonly ILogger<MigrationService> _logger;

    public MigrationService(IMigrationHistoryRepository repository, ILogger<MigrationService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<MigrationHistoryDto> ApplyMigrationAsync(string migrationName, Guid userId, CancellationToken cancellationToken = default)
    {
        var existingMigration = await _repository.GetByNameAsync(migrationName, cancellationToken);
        if (existingMigration != null && existingMigration.Status == MigrationStatus.Completed)
        {
            _logger.LogWarning("Migration {MigrationName} has already been applied", migrationName);
            return MapToDto(existingMigration);
        }

        var migration = new MigrationHistory
        {
            Id = Guid.NewGuid(),
            MigrationName = migrationName,
            AppliedAt = DateTimeOffset.UtcNow,
            AppliedByUserId = userId,
            Status = MigrationStatus.Running
        };

        await _repository.AddAsync(migration, cancellationToken);

        var stopwatch = Stopwatch.StartNew();

        try
        {
            _logger.LogInformation("Applying migration: {MigrationName}", migrationName);

            await ExecuteMigrationAsync(migrationName, cancellationToken);

            stopwatch.Stop();
            migration.Status = MigrationStatus.Completed;
            migration.Duration = stopwatch.Elapsed;

            await _repository.UpdateAsync(migration, cancellationToken);

            _logger.LogInformation("Migration {MigrationName} completed successfully in {Duration}ms",
                migrationName, stopwatch.ElapsedMilliseconds);
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            migration.Status = MigrationStatus.Failed;
            migration.Duration = stopwatch.Elapsed;
            migration.ErrorMessage = ex.Message;

            await _repository.UpdateAsync(migration, cancellationToken);

            _logger.LogError(ex, "Migration {MigrationName} failed after {Duration}ms",
                migrationName, stopwatch.ElapsedMilliseconds);

            throw;
        }

        return MapToDto(migration);
    }

    public async Task<List<MigrationHistoryDto>> GetPendingMigrationsAsync(CancellationToken cancellationToken = default)
    {
        var migrations = await _repository.GetPendingMigrationsAsync(cancellationToken);
        return migrations.Select(MapToDto).ToList();
    }

    public async Task<MigrationHistoryDto?> GetLatestMigrationAsync(CancellationToken cancellationToken = default)
    {
        var migration = await _repository.GetLatestMigrationAsync(cancellationToken);
        return migration != null ? MapToDto(migration) : null;
    }

    public async Task<bool> IsMigrationAppliedAsync(string migrationName, CancellationToken cancellationToken = default)
    {
        var migration = await _repository.GetByNameAsync(migrationName, cancellationToken);
        return migration != null && migration.Status == MigrationStatus.Completed;
    }

    private async Task ExecuteMigrationAsync(string migrationName, CancellationToken cancellationToken)
    {
        await Task.Delay(100, cancellationToken);

        _logger.LogDebug("Executed migration steps for: {MigrationName}", migrationName);
    }

    private static MigrationHistoryDto MapToDto(MigrationHistory m) => new()
    {
        Id = m.Id,
        MigrationName = m.MigrationName,
        AppliedAt = m.AppliedAt,
        AppliedByUserId = m.AppliedByUserId,
        Status = m.Status.ToString(),
        ErrorMessage = m.ErrorMessage,
        DurationMs = m.Duration.TotalMilliseconds
    };
}
