using Onesign.Modules.MultiRegion.Domain.Entities;

namespace Onesign.Modules.MultiRegion.Domain.Services;

public interface IRegionHealthMonitor
{
    Task<RegionHealthStatus> CheckRegionHealthAsync(string regionId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<RegionHealthStatus>> CheckAllRegionsHealthAsync(CancellationToken cancellationToken = default);
    Task RecordHealthCheckResultAsync(string regionId, RegionHealthStatus status, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<RegionHealthHistory>> GetHealthHistoryAsync(string regionId, int count = 100, CancellationToken cancellationToken = default);
    Task<bool> IsRegionHealthyAsync(string regionId, CancellationToken cancellationToken = default);
    Task<RegionHealthMetrics> GetHealthMetricsAsync(string regionId, TimeSpan period, CancellationToken cancellationToken = default);
}

public class RegionHealthStatus
{
    public string RegionId { get; set; } = string.Empty;
    public string RegionName { get; set; } = string.Empty;
    public bool IsHealthy { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CheckedAt { get; set; }
    public int ResponseTimeMs { get; set; }
    public Dictionary<string, ServiceHealthStatus> Services { get; set; } = new();
    public string? ErrorMessage { get; set; }
}

public class ServiceHealthStatus
{
    public string ServiceName { get; set; } = string.Empty;
    public bool IsHealthy { get; set; }
    public int ResponseTimeMs { get; set; }
    public string? ErrorMessage { get; set; }
}

public class RegionHealthHistory
{
    public Guid Id { get; set; }
    public string RegionId { get; set; } = string.Empty;
    public bool IsHealthy { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CheckedAt { get; set; }
    public int ResponseTimeMs { get; set; }
    public string? ErrorMessage { get; set; }
}

public class RegionHealthMetrics
{
    public string RegionId { get; set; } = string.Empty;
    public double UptimePercentage { get; set; }
    public int AverageResponseTimeMs { get; set; }
    public int TotalChecks { get; set; }
    public int FailedChecks { get; set; }
    public DateTime PeriodStart { get; set; }
    public DateTime PeriodEnd { get; set; }
}
