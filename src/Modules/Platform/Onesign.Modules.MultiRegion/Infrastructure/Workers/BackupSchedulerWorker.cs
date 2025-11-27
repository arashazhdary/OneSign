using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Onesign.Modules.MultiRegion.Domain.Repositories;
using Onesign.Modules.MultiRegion.Domain.Services;

namespace Onesign.Modules.MultiRegion.Infrastructure.Workers;

public class BackupSchedulerWorker : BackgroundService
{
    private readonly IBackupService _backupService;
    private readonly ITenantBackupSetRepository _backupRepository;
    private readonly ILogger<BackupSchedulerWorker> _logger;
    private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(5);

    public BackupSchedulerWorker(
        IBackupService backupService,
        ITenantBackupSetRepository backupRepository,
        ILogger<BackupSchedulerWorker> logger)
    {
        _backupService = backupService;
        _backupRepository = backupRepository;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("BackupSchedulerWorker started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessScheduledBackupsAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing scheduled backups");
            }

            await Task.Delay(_checkInterval, stoppingToken);
        }

        _logger.LogInformation("BackupSchedulerWorker stopped");
    }

    private async Task ProcessScheduledBackupsAsync(CancellationToken cancellationToken)
    {
        _logger.LogDebug("Checking for scheduled backups");

        var tenantIds = await GetTenantsWithScheduledBackupsAsync(cancellationToken);

        foreach (var tenantId in tenantIds)
        {
            try
            {
                var schedules = await _backupService.GetBackupSchedulesAsync(tenantId, cancellationToken);

                foreach (var schedule in schedules.Where(s => s.IsEnabled && ShouldRunSchedule(s)))
                {
                    _logger.LogInformation("Executing scheduled backup {ScheduleId} for tenant {TenantId}",
                        schedule.Id, tenantId);

                    var backupRequest = new BackupRequest
                    {
                        TenantId = tenantId,
                        BackupType = schedule.BackupType,
                        Description = $"Scheduled backup: {schedule.Name}"
                    };

                    var result = await _backupService.CreateBackupAsync(backupRequest, cancellationToken);

                    if (result.Status == "InProgress")
                    {
                        _logger.LogInformation("Scheduled backup {BackupId} started for tenant {TenantId}",
                            result.BackupId, tenantId);
                    }
                    else
                    {
                        _logger.LogWarning("Scheduled backup failed for tenant {TenantId}: {Error}",
                            tenantId, result.ErrorMessage);
                    }

                    await _backupService.ApplyRetentionPolicyAsync(tenantId, schedule.RetentionDays, cancellationToken);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing backups for tenant {TenantId}", tenantId);
            }
        }
    }

    private bool ShouldRunSchedule(BackupSchedule schedule)
    {
        if (schedule.NextRunAt == null)
        {
            return true;
        }

        return DateTime.UtcNow >= schedule.NextRunAt.Value;
    }

    private async Task<IEnumerable<Guid>> GetTenantsWithScheduledBackupsAsync(CancellationToken cancellationToken)
    {
        // In a production system, this would query a BackupScheduleRepository to get
        // all tenants that have active backup schedules configured.
        // For now, we'll query the backup repository to get tenants that have existing backups,
        // as they are likely to have schedules configured.

        try
        {
            // Get all backups and extract distinct tenant IDs
            var allBackups = await _backupRepository.GetByStatusAsync(
                Domain.Enums.BackupStatus.Completed,
                cancellationToken);

            var tenantIds = allBackups
                .Select(b => b.TenantId)
                .Distinct()
                .ToList();

            _logger.LogDebug("Found {Count} tenants with backup history", tenantIds.Count);

            return tenantIds;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tenants with scheduled backups");
            return new List<Guid>();
        }
    }
}
