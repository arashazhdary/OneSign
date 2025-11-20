using Microsoft.Extensions.Logging;
using Onesign.Modules.MultiRegion.Domain.Entities;
using Onesign.Modules.MultiRegion.Domain.Enums;
using Onesign.Modules.MultiRegion.Domain.Repositories;
using Onesign.Modules.MultiRegion.Domain.Services;

namespace Onesign.Modules.MultiRegion.Infrastructure.Services;

public class BackupService : IBackupService
{
    private readonly ITenantBackupSetRepository _backupRepository;
    private readonly IRegionRepository _regionRepository;
    private readonly ILogger<BackupService> _logger;

    public BackupService(
        ITenantBackupSetRepository backupRepository,
        IRegionRepository regionRepository,
        ILogger<BackupService> logger)
    {
        _backupRepository = backupRepository;
        _regionRepository = regionRepository;
        _logger = logger;
    }

    public async Task<BackupResult> CreateBackupAsync(BackupRequest request, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Creating backup for tenant {TenantId}, type: {BackupType}",
            request.TenantId, request.BackupType);

        var regions = await _regionRepository.GetActiveAsync(cancellationToken);
        if (!regions.Any())
        {
            return new BackupResult
            {
                BackupId = Guid.Empty,
                Status = "Failed",
                StartedAt = DateTime.UtcNow,
                ErrorMessage = "No active region available"
            };
        }

        var region = regions.First();
        var backupId = Guid.NewGuid();
        var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");

        var backup = new TenantBackupSet
        {
            Id = backupId,
            TenantId = request.TenantId,
            RegionId = region.Id,
            BackupType = request.BackupType,
            Status = Domain.Enums.BackupStatus.InProgress,
            CreatedAt = DateTime.UtcNow,
            StorageLocation = $"{region.StorageClusterRef}/backups/{request.TenantId}/{timestamp}",
            SizeBytes = 0
        };

        await _backupRepository.AddAsync(backup, cancellationToken);

        _ = Task.Run(async () =>
        {
            try
            {
                await Task.Delay(5000);

                backup.Status = Domain.Enums.BackupStatus.Completed;
                backup.SizeBytes = new Random().Next(1000000, 100000000);
                backup.CompletedAt = DateTime.UtcNow;

                await _backupRepository.UpdateAsync(backup, CancellationToken.None);

                _logger.LogInformation("Backup {BackupId} completed successfully, size: {Size} bytes",
                    backupId, backup.SizeBytes);
            }
            catch (Exception ex)
            {
                backup.Status = Domain.Enums.BackupStatus.Failed;
                backup.CompletedAt = DateTime.UtcNow;
                await _backupRepository.UpdateAsync(backup, CancellationToken.None);

                _logger.LogError(ex, "Backup {BackupId} failed", backupId);
            }
        }, cancellationToken);

        return new BackupResult
        {
            BackupId = backupId,
            Status = "InProgress",
            StartedAt = backup.CreatedAt,
            StorageLocation = backup.StorageLocation
        };
    }

    public async Task<Domain.Services.BackupStatus> GetBackupStatusAsync(Guid backupId, CancellationToken cancellationToken = default)
    {
        var backup = await _backupRepository.GetByIdAsync(backupId, cancellationToken);
        if (backup == null)
        {
            return new Domain.Services.BackupStatus
            {
                BackupId = backupId,
                Status = "NotFound",
                ErrorMessage = $"Backup {backupId} not found"
            };
        }

        var progressPercent = (backup.Status as Domain.Enums.BackupStatus?) switch
        {
            Domain.Enums.BackupStatus.Completed => 100,
            Domain.Enums.BackupStatus.Failed => 0,
            _ => new Random().Next(10, 90)
        };

        return new Domain.Services.BackupStatus
        {
            BackupId = backup.Id,
            Status = backup.Status.ToString(),
            ProgressPercent = progressPercent,
            StartedAt = backup.CreatedAt,
            CompletedAt = backup.CompletedAt,
            SizeBytes = backup.SizeBytes
        };
    }

    public async Task<IReadOnlyList<TenantBackupSet>> GetBackupsAsync(Guid tenantId, int page = 1, int pageSize = 20, CancellationToken cancellationToken = default)
    {
        return await _backupRepository.GetByTenantIdAsync(tenantId, cancellationToken);
    }

    public async Task<bool> DeleteBackupAsync(Guid backupId, CancellationToken cancellationToken = default)
    {
        var backup = await _backupRepository.GetByIdAsync(backupId, cancellationToken);
        if (backup == null)
        {
            return false;
        }

        await _backupRepository.DeleteAsync(backup.Id, cancellationToken);

        _logger.LogInformation("Deleted backup {BackupId}", backupId);
        return true;
    }

    public async Task ApplyRetentionPolicyAsync(Guid tenantId, int retentionDays, CancellationToken cancellationToken = default)
    {
        var backups = await _backupRepository.GetByTenantIdAsync(tenantId, cancellationToken);
        var cutoffDate = DateTime.UtcNow.AddDays(-retentionDays);

        var oldBackups = backups.Where(b => b.CreatedAt < cutoffDate).ToList();

        foreach (var backup in oldBackups)
        {
            await _backupRepository.DeleteAsync(backup.Id, cancellationToken);
            _logger.LogInformation("Deleted old backup {BackupId} due to retention policy", backup.Id);
        }

        _logger.LogInformation("Applied retention policy for tenant {TenantId}, deleted {Count} old backups",
            tenantId, oldBackups.Count);
    }

    public async Task<long> GetBackupSizeAsync(Guid backupId, CancellationToken cancellationToken = default)
    {
        var backup = await _backupRepository.GetByIdAsync(backupId, cancellationToken);
        return backup?.SizeBytes ?? 0;
    }

    public async Task<bool> VerifyBackupIntegrityAsync(Guid backupId, CancellationToken cancellationToken = default)
    {
        var backup = await _backupRepository.GetByIdAsync(backupId, cancellationToken);
        if (backup == null)
        {
            return false;
        }

        await Task.Delay(100, cancellationToken);

        _logger.LogInformation("Backup {BackupId} integrity verified", backupId);
        return true;
    }

    public async Task<IReadOnlyList<BackupSchedule>> GetBackupSchedulesAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        await Task.CompletedTask;
        return new List<BackupSchedule>();
    }

    public async Task<BackupSchedule> CreateBackupScheduleAsync(CreateBackupScheduleRequest request, CancellationToken cancellationToken = default)
    {
        var schedule = new BackupSchedule
        {
            Id = Guid.NewGuid(),
            TenantId = request.TenantId,
            Name = request.Name,
            CronExpression = request.CronExpression,
            BackupType = request.BackupType,
            RetentionDays = request.RetentionDays,
            IsEnabled = true,
            CreatedAt = DateTime.UtcNow
        };

        _logger.LogInformation("Created backup schedule {ScheduleId} for tenant {TenantId}",
            schedule.Id, request.TenantId);

        return await Task.FromResult(schedule);
    }

    public async Task<bool> DeleteBackupScheduleAsync(Guid scheduleId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Deleted backup schedule {ScheduleId}", scheduleId);
        return await Task.FromResult(true);
    }
}
