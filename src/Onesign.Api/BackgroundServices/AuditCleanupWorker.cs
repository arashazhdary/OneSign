using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Onesign.Api.Data;

namespace Onesign.Api.BackgroundServices;

/// <summary>
/// Background worker that cleans old audit events based on retention settings.
/// Runs weekly to remove audit data that has exceeded the configured retention period.
/// </summary>
public class AuditCleanupWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<AuditCleanupWorker> _logger;
    private readonly IConfiguration _configuration;

    private const int BatchSize = 1000;

    public AuditCleanupWorker(
        IServiceProvider serviceProvider,
        ILogger<AuditCleanupWorker> logger,
        IConfiguration configuration)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _configuration = configuration;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var intervalDays = _configuration.GetValue("BackgroundServices:AuditCleanup:IntervalDays", 7);
        var checkInterval = TimeSpan.FromDays(intervalDays);

        _logger.LogInformation("AuditCleanupWorker starting with interval of {Interval} days", intervalDays);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CleanupOldAuditEventsAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in AuditCleanupWorker execution");
            }

            await Task.Delay(checkInterval, stoppingToken);
        }
    }

    private async Task CleanupOldAuditEventsAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<OnesignDbContext>();

        // Get default retention period from configuration (in days)
        var defaultRetentionDays = _configuration.GetValue("BackgroundServices:AuditCleanup:DefaultRetentionDays", 90);

        // Get all tenants
        var tenants = await dbContext.Tenants
            .Select(t => new { t.Id, t.Name })
            .ToListAsync(cancellationToken);

        var totalDeletedCount = 0;

        foreach (var tenant in tenants)
        {
            try
            {
                // Check for tenant-specific retention policy
                var retentionPolicy = await dbContext.DataRetentionPolicies
                    .FirstOrDefaultAsync(p => p.TenantId == tenant.Id &&
                                             p.DataCategory == 0 && // AuditLogs
                                             p.Enabled, cancellationToken);

                var retentionDays = retentionPolicy?.RetentionPeriodDays ?? defaultRetentionDays;
                var cutoffDate = DateTime.UtcNow.AddDays(-retentionDays);

                var deletedCount = await CleanupTenantAuditEventsAsync(
                    dbContext, tenant.Id, cutoffDate, cancellationToken);

                totalDeletedCount += deletedCount;

                if (deletedCount > 0)
                {
                    _logger.LogInformation(
                        "Cleaned up {Count} audit events for tenant {TenantId} ({TenantName}) older than {CutoffDate}",
                        deletedCount, tenant.Id, tenant.Name, cutoffDate);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cleaning up audit events for tenant {TenantId}", tenant.Id);
            }
        }

        // Also clean up global audit events (TenantId = null)
        try
        {
            var globalCutoffDate = DateTime.UtcNow.AddDays(-defaultRetentionDays);
            var globalDeletedCount = await CleanupGlobalAuditEventsAsync(
                dbContext, globalCutoffDate, cancellationToken);

            totalDeletedCount += globalDeletedCount;

            if (globalDeletedCount > 0)
            {
                _logger.LogInformation(
                    "Cleaned up {Count} global audit events older than {CutoffDate}",
                    globalDeletedCount, globalCutoffDate);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cleaning up global audit events");
        }

        _logger.LogInformation(
            "Audit cleanup completed at {Time}, total events deleted: {TotalCount}",
            DateTime.UtcNow, totalDeletedCount);
    }

    private async Task<int> CleanupTenantAuditEventsAsync(
        OnesignDbContext dbContext,
        Guid tenantId,
        DateTime cutoffDate,
        CancellationToken cancellationToken)
    {
        var totalDeleted = 0;

        // Delete in batches to avoid memory issues with large datasets
        while (true)
        {
            var batch = await dbContext.AuditEvents
                .Where(a => a.TenantId == tenantId && a.CreatedAt < cutoffDate)
                .OrderBy(a => a.CreatedAt)
                .Take(BatchSize)
                .ToListAsync(cancellationToken);

            if (!batch.Any())
            {
                break;
            }

            dbContext.AuditEvents.RemoveRange(batch);
            await dbContext.SaveChangesAsync(cancellationToken);

            totalDeleted += batch.Count;

            _logger.LogDebug("Deleted batch of {Count} audit events for tenant {TenantId}",
                batch.Count, tenantId);

            // Small delay to reduce database pressure
            if (batch.Count == BatchSize)
            {
                await Task.Delay(100, cancellationToken);
            }
        }

        return totalDeleted;
    }

    private async Task<int> CleanupGlobalAuditEventsAsync(
        OnesignDbContext dbContext,
        DateTime cutoffDate,
        CancellationToken cancellationToken)
    {
        var totalDeleted = 0;

        while (true)
        {
            var batch = await dbContext.AuditEvents
                .Where(a => a.TenantId == null && a.CreatedAt < cutoffDate)
                .OrderBy(a => a.CreatedAt)
                .Take(BatchSize)
                .ToListAsync(cancellationToken);

            if (!batch.Any())
            {
                break;
            }

            dbContext.AuditEvents.RemoveRange(batch);
            await dbContext.SaveChangesAsync(cancellationToken);

            totalDeleted += batch.Count;

            if (batch.Count == BatchSize)
            {
                await Task.Delay(100, cancellationToken);
            }
        }

        return totalDeleted;
    }
}
