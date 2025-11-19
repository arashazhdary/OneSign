using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Onesign.Modules.MultiRegion.Domain.Services;

namespace Onesign.Modules.MultiRegion.Infrastructure.Workers;

public class BackupSchedulerWorker : BackgroundService
{
    private readonly IBackupService _backupService;
    private readonly ILogger<BackupSchedulerWorker> _logger;
    private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(5);

    public BackupSchedulerWorker(
        IBackupService backupService,
        ILogger<BackupSchedulerWorker> logger)
    {
        _backupService = backupService;
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
        await Task.CompletedTask;
        return new List<Guid>();
    }
}
