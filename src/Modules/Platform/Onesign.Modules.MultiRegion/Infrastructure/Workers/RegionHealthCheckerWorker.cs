using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Onesign.Modules.MultiRegion.Domain.Services;

namespace Onesign.Modules.MultiRegion.Infrastructure.Workers;

public class RegionHealthCheckerWorker : BackgroundService
{
    private readonly IRegionHealthMonitor _healthMonitor;
    private readonly ILogger<RegionHealthCheckerWorker> _logger;
    private readonly TimeSpan _checkInterval = TimeSpan.FromSeconds(30);

    public RegionHealthCheckerWorker(
        IRegionHealthMonitor healthMonitor,
        ILogger<RegionHealthCheckerWorker> logger)
    {
        _healthMonitor = healthMonitor;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("RegionHealthCheckerWorker started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CheckAllRegionsHealthAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking region health");
            }

            await Task.Delay(_checkInterval, stoppingToken);
        }

        _logger.LogInformation("RegionHealthCheckerWorker stopped");
    }

    private async Task CheckAllRegionsHealthAsync(CancellationToken cancellationToken)
    {
        var healthStatuses = await _healthMonitor.CheckAllRegionsHealthAsync(cancellationToken);

        foreach (var status in healthStatuses)
        {
            await _healthMonitor.RecordHealthCheckResultAsync(status.RegionId, status, cancellationToken);

            if (!status.IsHealthy)
            {
                _logger.LogWarning("Region {RegionId} is unhealthy: {Status} - {Error}",
                    status.RegionId, status.Status, status.ErrorMessage);

                await HandleUnhealthyRegionAsync(status, cancellationToken);
            }
            else
            {
                _logger.LogDebug("Region {RegionId} is healthy, response time: {ResponseTime}ms",
                    status.RegionId, status.ResponseTimeMs);
            }
        }

        var unhealthyCount = healthStatuses.Count(s => !s.IsHealthy);
        if (unhealthyCount > 0)
        {
            _logger.LogWarning("Health check completed: {Healthy}/{Total} regions healthy",
                healthStatuses.Count - unhealthyCount, healthStatuses.Count);
        }
        else
        {
            _logger.LogDebug("Health check completed: all {Total} regions healthy", healthStatuses.Count);
        }
    }

    private async Task HandleUnhealthyRegionAsync(RegionHealthStatus status, CancellationToken cancellationToken)
    {
        _logger.LogWarning("Handling unhealthy region: {RegionId}, Status: {Status}, ResponseTime: {ResponseTime}ms",
            status.RegionId, status.Status, status.ResponseTimeMs);

        // Check if region has been unhealthy for multiple consecutive checks
        var recentHistory = await _healthMonitor.GetHealthHistoryAsync(status.RegionId, 5, cancellationToken);
        var consecutiveFailures = recentHistory.TakeWhile(h => !h.IsHealthy).Count();

        if (consecutiveFailures >= 3)
        {
            _logger.LogError("Region {RegionId} has failed {Count} consecutive health checks. Critical intervention required.",
                status.RegionId, consecutiveFailures);

            // In a production system, this would trigger:
            // 1. Alert notifications to operations team
            // 2. Potential automatic failover to backup region
            // 3. Incident creation in monitoring systems
            // 4. Customer notifications if necessary

            _logger.LogWarning("Automated failover capabilities would be triggered here for region {RegionId}",
                status.RegionId);
        }
        else if (consecutiveFailures >= 1)
        {
            _logger.LogWarning("Region {RegionId} is unhealthy. Monitoring for recovery. Consecutive failures: {Count}",
                status.RegionId, consecutiveFailures);
        }

        // Record the unhealthy state for historical tracking and alerting
        await Task.CompletedTask;
    }
}
