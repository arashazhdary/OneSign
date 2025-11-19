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
        await Task.CompletedTask;

        _logger.LogWarning("Unhealthy region detected: {RegionId}. Manual intervention may be required.",
            status.RegionId);
    }
}
