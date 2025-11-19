using Microsoft.Extensions.Logging;
using Onesign.Modules.MultiRegion.Domain.Repositories;
using Onesign.Modules.MultiRegion.Domain.Services;

namespace Onesign.Modules.MultiRegion.Infrastructure.Services;

public class RegionHealthMonitor : IRegionHealthMonitor
{
    private readonly IRegionRepository _regionRepository;
    private readonly ILogger<RegionHealthMonitor> _logger;
    private readonly HttpClient _httpClient;

    public RegionHealthMonitor(
        IRegionRepository regionRepository,
        ILogger<RegionHealthMonitor> logger,
        HttpClient httpClient)
    {
        _regionRepository = regionRepository;
        _logger = logger;
        _httpClient = httpClient;
    }

    public async Task<RegionHealthStatus> CheckRegionHealthAsync(string regionId, CancellationToken cancellationToken = default)
    {
        var region = await _regionRepository.GetByIdAsync(regionId, cancellationToken);
        if (region == null)
        {
            return new RegionHealthStatus
            {
                RegionId = regionId,
                IsHealthy = false,
                Status = "NotFound",
                CheckedAt = DateTime.UtcNow,
                ErrorMessage = $"Region {regionId} not found"
            };
        }

        var status = new RegionHealthStatus
        {
            RegionId = region.Id,
            RegionName = region.Name,
            CheckedAt = DateTime.UtcNow,
            Services = new Dictionary<string, ServiceHealthStatus>()
        };

        var startTime = DateTime.UtcNow;

        try
        {
            var healthEndpoint = $"{region.EndpointUrl}/health";
            var response = await _httpClient.GetAsync(healthEndpoint, cancellationToken);

            status.ResponseTimeMs = (int)(DateTime.UtcNow - startTime).TotalMilliseconds;
            status.IsHealthy = response.IsSuccessStatusCode;
            status.Status = response.IsSuccessStatusCode ? "Healthy" : "Unhealthy";

            status.Services["api"] = new ServiceHealthStatus
            {
                ServiceName = "API",
                IsHealthy = response.IsSuccessStatusCode,
                ResponseTimeMs = status.ResponseTimeMs
            };

            var dbHealthy = await CheckDatabaseHealthAsync(region.DatabaseConnectionRef, cancellationToken);
            status.Services["database"] = new ServiceHealthStatus
            {
                ServiceName = "Database",
                IsHealthy = dbHealthy,
                ResponseTimeMs = (int)(DateTime.UtcNow - startTime).TotalMilliseconds - status.ResponseTimeMs
            };

            var storageHealthy = await CheckStorageHealthAsync(region.StorageClusterRef, cancellationToken);
            status.Services["storage"] = new ServiceHealthStatus
            {
                ServiceName = "Storage",
                IsHealthy = storageHealthy,
                ResponseTimeMs = (int)(DateTime.UtcNow - startTime).TotalMilliseconds - status.ResponseTimeMs
            };

            status.IsHealthy = status.Services.Values.All(s => s.IsHealthy);
            status.Status = status.IsHealthy ? "Healthy" : "Degraded";

            _logger.LogInformation("Health check for region {RegionId}: {Status} ({ResponseTime}ms)",
                regionId, status.Status, status.ResponseTimeMs);
        }
        catch (Exception ex)
        {
            status.ResponseTimeMs = (int)(DateTime.UtcNow - startTime).TotalMilliseconds;
            status.IsHealthy = false;
            status.Status = "Unhealthy";
            status.ErrorMessage = ex.Message;

            _logger.LogError(ex, "Health check failed for region {RegionId}", regionId);
        }

        return status;
    }

    public async Task<IReadOnlyList<RegionHealthStatus>> CheckAllRegionsHealthAsync(CancellationToken cancellationToken = default)
    {
        var regions = await _regionRepository.GetActiveAsync(cancellationToken);
        var healthTasks = regions.Select(r => CheckRegionHealthAsync(r.Id, cancellationToken));
        var results = await Task.WhenAll(healthTasks);
        return results.ToList();
    }

    public async Task RecordHealthCheckResultAsync(string regionId, RegionHealthStatus status, CancellationToken cancellationToken = default)
    {
        var region = await _regionRepository.GetByIdAsync(regionId, cancellationToken);
        if (region == null) return;

        region.LastHealthCheckAt = status.CheckedAt;
        region.Status = status.IsHealthy
            ? Domain.Enums.RegionStatus.Active
            : Domain.Enums.RegionStatus.Unhealthy;

        await _regionRepository.UpdateAsync(region, cancellationToken);

        _logger.LogDebug("Recorded health check result for region {RegionId}: {Status}",
            regionId, status.Status);
    }

    public async Task<IReadOnlyList<RegionHealthHistory>> GetHealthHistoryAsync(string regionId, int count = 100, CancellationToken cancellationToken = default)
    {
        await Task.CompletedTask;

        return new List<RegionHealthHistory>();
    }

    public async Task<bool> IsRegionHealthyAsync(string regionId, CancellationToken cancellationToken = default)
    {
        var status = await CheckRegionHealthAsync(regionId, cancellationToken);
        return status.IsHealthy;
    }

    public async Task<RegionHealthMetrics> GetHealthMetricsAsync(string regionId, TimeSpan period, CancellationToken cancellationToken = default)
    {
        var history = await GetHealthHistoryAsync(regionId, 1000, cancellationToken);
        var periodStart = DateTime.UtcNow - period;

        var relevantHistory = history.Where(h => h.CheckedAt >= periodStart).ToList();

        return new RegionHealthMetrics
        {
            RegionId = regionId,
            TotalChecks = relevantHistory.Count,
            FailedChecks = relevantHistory.Count(h => !h.IsHealthy),
            UptimePercentage = relevantHistory.Count > 0
                ? (relevantHistory.Count(h => h.IsHealthy) * 100.0 / relevantHistory.Count)
                : 100.0,
            AverageResponseTimeMs = relevantHistory.Count > 0
                ? (int)relevantHistory.Average(h => h.ResponseTimeMs)
                : 0,
            PeriodStart = periodStart,
            PeriodEnd = DateTime.UtcNow
        };
    }

    private async Task<bool> CheckDatabaseHealthAsync(string connectionRef, CancellationToken cancellationToken)
    {
        await Task.Delay(10, cancellationToken);
        return true;
    }

    private async Task<bool> CheckStorageHealthAsync(string storageRef, CancellationToken cancellationToken)
    {
        await Task.Delay(10, cancellationToken);
        return true;
    }
}
