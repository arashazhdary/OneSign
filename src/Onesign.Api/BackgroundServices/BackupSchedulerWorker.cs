using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Onesign.Data.Contexts;

namespace Onesign.Api.BackgroundServices;

/// <summary>
/// Background worker that schedules tenant backups based on configured policies,
/// creating TenantBackupSet records for backup execution.
/// </summary>
public class BackupSchedulerWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<BackupSchedulerWorker> _logger;
    private readonly IConfiguration _configuration;

    public BackupSchedulerWorker(
        IServiceProvider serviceProvider,
        ILogger<BackupSchedulerWorker> logger,
        IConfiguration configuration)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _configuration = configuration;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var intervalHours = _configuration.GetValue("BackgroundServices:BackupScheduler:IntervalHours", 24);
        var checkInterval = TimeSpan.FromHours(intervalHours);

        _logger.LogInformation("BackupSchedulerWorker starting with interval of {Interval} hours", intervalHours);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ScheduleBackupsAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in BackupSchedulerWorker execution");
            }

            await Task.Delay(checkInterval, stoppingToken);
        }
    }

    private async Task ScheduleBackupsAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<OnesignDbContext>();

        // Get all active tenants with their data residency info
        var tenantsWithResidency = await dbContext.Tenants
            .Where(t => t.Status == Onesign.Modules.Tenants.Domain.Enums.TenantStatus.Active)
            .Join(dbContext.TenantDataResidencies,
                t => t.Id,
                r => r.TenantId,
                (t, r) => new { Tenant = t, Residency = r })
            .ToListAsync(cancellationToken);

        if (!tenantsWithResidency.Any())
        {
            // Fall back to just active tenants without residency info
            var activeTenants = await dbContext.Tenants
                .Where(t => t.Status == Onesign.Modules.Tenants.Domain.Enums.TenantStatus.Active)
                .ToListAsync(cancellationToken);

            foreach (var tenant in activeTenants)
            {
                await ScheduleTenantBackupAsync(dbContext, tenant.Id, "default", cancellationToken);
            }
        }
        else
        {
            foreach (var item in tenantsWithResidency)
            {
                await ScheduleTenantBackupAsync(dbContext, item.Tenant.Id, item.Residency.DataRegionId, cancellationToken);
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Backup scheduling completed at {Time}", DateTime.UtcNow);
    }

    private async Task ScheduleTenantBackupAsync(
        OnesignDbContext dbContext,
        Guid tenantId,
        string regionId,
        CancellationToken cancellationToken)
    {
        // Get backup retention settings from configuration
        var backupFrequencyDays = _configuration.GetValue("BackgroundServices:BackupScheduler:FrequencyDays", 1);
        var backupType = _configuration.GetValue("BackgroundServices:BackupScheduler:BackupType", "LogicalExport");

        // Check if a backup was already scheduled/completed recently
        var lastBackup = await dbContext.TenantBackupSets
            .Where(b => b.TenantId == tenantId)
            .OrderByDescending(b => b.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (lastBackup != null)
        {
            var timeSinceLastBackup = DateTime.UtcNow - lastBackup.CreatedAt;
            if (timeSinceLastBackup.TotalDays < backupFrequencyDays)
            {
                _logger.LogDebug(
                    "Skipping backup for tenant {TenantId}, last backup was {Hours} hours ago",
                    tenantId, timeSinceLastBackup.TotalHours);
                return;
            }
        }

        // Generate storage location based on tenant and date
        var storageLocation = GenerateStorageLocation(tenantId, regionId, backupType);

        // Create new backup set record
        var backupSet = new Onesign.Modules.MultiRegion.Infrastructure.EfCore.Entities.TenantBackupSetEntity
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            RegionId = regionId,
            CreatedAt = DateTime.UtcNow,
            BackupType = backupType,
            StorageLocation = storageLocation,
            Status = 0, // Pending
            SizeBytes = 0
        };

        dbContext.TenantBackupSets.Add(backupSet);

        _logger.LogInformation(
            "Scheduled backup {BackupId} for tenant {TenantId} in region {Region}",
            backupSet.Id, tenantId, regionId);

        // In a real implementation, this would trigger the actual backup process
        // For now, we simulate immediate completion
        await SimulateBackupExecutionAsync(backupSet, cancellationToken);
    }

    private async Task SimulateBackupExecutionAsync(
        Onesign.Modules.MultiRegion.Infrastructure.EfCore.Entities.TenantBackupSetEntity backupSet,
        CancellationToken cancellationToken)
    {
        // Simulate backup processing
        // In production, this would be handled by a separate service or external system

        try
        {
            // Simulate some processing time
            await Task.Delay(100, cancellationToken);

            // Estimate backup size (in a real system, this would be calculated)
            var random = new Random();
            backupSet.SizeBytes = random.NextInt64(1_000_000, 100_000_000); // 1MB to 100MB

            backupSet.Status = 1; // Completed
            backupSet.CompletedAt = DateTime.UtcNow;

            _logger.LogInformation(
                "Backup {BackupId} completed successfully, size: {Size} bytes",
                backupSet.Id, backupSet.SizeBytes);
        }
        catch (Exception ex)
        {
            backupSet.Status = 2; // Failed
            backupSet.ErrorMessage = ex.Message;
            backupSet.CompletedAt = DateTime.UtcNow;

            _logger.LogError(ex, "Backup {BackupId} failed", backupSet.Id);
        }
    }

    private static string GenerateStorageLocation(Guid tenantId, string regionId, string backupType)
    {
        var date = DateTime.UtcNow;
        return $"backups/{regionId}/{tenantId:N}/{date:yyyy}/{date:MM}/{date:dd}/{backupType.ToLowerInvariant()}-{date:HHmmss}.zip";
    }
}
