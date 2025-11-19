using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using Onesign.Modules.Insights.Application.Services;

namespace Onesign.Modules.Insights.Application.Jobs;

/// <summary>
/// Background job that runs daily to calculate and aggregate insights data:
/// - TenantDailyUsageSnapshot: Overall tenant usage metrics
/// - ApplicationDailyUsageSnapshot: Per-application usage metrics
/// - UserSecurityPosture: Security posture for each user
/// </summary>
public class DailyInsightsAggregationJob : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DailyInsightsAggregationJob> _logger;
    private readonly IConfiguration _configuration;

    public DailyInsightsAggregationJob(
        IServiceProvider serviceProvider,
        ILogger<DailyInsightsAggregationJob> logger,
        IConfiguration configuration)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _configuration = configuration;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // Get configuration values
        var runAtHour = _configuration.GetValue("BackgroundServices:InsightsAggregation:RunAtHourUtc", 2);
        var retentionDays = _configuration.GetValue("BackgroundServices:InsightsAggregation:RetentionDays", 90);

        _logger.LogInformation(
            "DailyInsightsAggregationJob starting. Configured to run daily at {Hour}:00 UTC",
            runAtHour);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                // Calculate delay until next run time
                var now = DateTime.UtcNow;
                var nextRun = now.Date.AddHours(runAtHour);

                // If we've already passed today's run time, schedule for tomorrow
                if (now >= nextRun)
                {
                    nextRun = nextRun.AddDays(1);
                }

                var delay = nextRun - now;
                _logger.LogInformation(
                    "Next insights aggregation scheduled for {NextRun} UTC (in {Hours} hours {Minutes} minutes)",
                    nextRun,
                    (int)delay.TotalHours,
                    delay.Minutes);

                await Task.Delay(delay, stoppingToken);

                // Run the aggregation
                await RunAggregationAsync(retentionDays, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                _logger.LogInformation("DailyInsightsAggregationJob is stopping");
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DailyInsightsAggregationJob execution");

                // Wait before retrying on error
                await Task.Delay(TimeSpan.FromMinutes(30), stoppingToken);
            }
        }
    }

    private async Task RunAggregationAsync(int retentionDays, CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var aggregationService = scope.ServiceProvider.GetRequiredService<IInsightsAggregationService>();

        var yesterday = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1));

        _logger.LogInformation("Starting daily insights aggregation for date {Date}", yesterday);

        try
        {
            // Generate snapshots for all tenants
            var result = await aggregationService.GenerateDailySnapshotsAsync(
                yesterday,
                null, // null means all tenants
                cancellationToken);

            if (result.Success)
            {
                _logger.LogInformation(
                    "Daily insights aggregation completed successfully. " +
                    "Generated {TenantSnapshots} tenant snapshots, {AppSnapshots} application snapshots, " +
                    "updated {UserPostures} user security postures",
                    result.TenantSnapshotsGenerated,
                    result.ApplicationSnapshotsGenerated,
                    result.UserPosturesUpdated);
            }
            else
            {
                _logger.LogError(
                    "Daily insights aggregation failed: {ErrorMessage}",
                    result.ErrorMessage);
            }

            // Cleanup old snapshots
            _logger.LogInformation("Starting cleanup of snapshots older than {Days} days", retentionDays);
            await aggregationService.CleanupOldSnapshotsAsync(retentionDays, cancellationToken);
            _logger.LogInformation("Old snapshots cleanup completed");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during daily insights aggregation");
            throw;
        }
    }

    /// <summary>
    /// Manually trigger aggregation for a specific date (useful for backfilling or testing)
    /// </summary>
    public async Task TriggerAggregationAsync(DateOnly date, Guid? tenantId, CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var aggregationService = scope.ServiceProvider.GetRequiredService<IInsightsAggregationService>();

        _logger.LogInformation(
            "Manual insights aggregation triggered for date {Date}, tenantId: {TenantId}",
            date,
            tenantId?.ToString() ?? "all");

        var result = await aggregationService.GenerateDailySnapshotsAsync(date, tenantId, cancellationToken);

        if (result.Success)
        {
            _logger.LogInformation(
                "Manual insights aggregation completed successfully. " +
                "Generated {TenantSnapshots} tenant snapshots, {AppSnapshots} application snapshots, " +
                "updated {UserPostures} user security postures",
                result.TenantSnapshotsGenerated,
                result.ApplicationSnapshotsGenerated,
                result.UserPosturesUpdated);
        }
        else
        {
            _logger.LogError("Manual insights aggregation failed: {ErrorMessage}", result.ErrorMessage);
            throw new InvalidOperationException(result.ErrorMessage);
        }
    }
}
