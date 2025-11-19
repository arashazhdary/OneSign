namespace Onesign.Shared.Platform.Services;

public interface IPlatformHealthAggregator
{
    Task<PlatformHealthReport> GetHealthReportAsync(CancellationToken cancellationToken = default);
    Task<ComponentHealth> GetComponentHealthAsync(string componentName, CancellationToken cancellationToken = default);
    Task<PlatformDiagnostics> GetDiagnosticsAsync(CancellationToken cancellationToken = default);
}

public class PlatformHealthReport
{
    public string OverallStatus { get; set; } = string.Empty;
    public DateTime CheckedAt { get; set; }
    public TimeSpan TotalCheckDuration { get; set; }
    public List<ComponentHealth> Components { get; set; } = new();
    public List<string> Warnings { get; set; } = new();
    public List<string> Errors { get; set; } = new();
}

public class ComponentHealth
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public TimeSpan ResponseTime { get; set; }
    public string? Description { get; set; }
    public Dictionary<string, object>? Data { get; set; }
    public List<ComponentHealth>? SubComponents { get; set; }
}

public class PlatformDiagnostics
{
    public DateTime GeneratedAt { get; set; }
    public SystemMetrics System { get; set; } = new();
    public ApplicationMetrics Application { get; set; } = new();
    public List<ModuleDiagnostics> Modules { get; set; } = new();
    public List<ConnectionDiagnostics> Connections { get; set; } = new();
    public Dictionary<string, string> Configuration { get; set; } = new();
}

public class SystemMetrics
{
    public double CpuUsagePercent { get; set; }
    public long MemoryUsedMB { get; set; }
    public long MemoryTotalMB { get; set; }
    public long DiskUsedGB { get; set; }
    public long DiskTotalGB { get; set; }
    public TimeSpan Uptime { get; set; }
}

public class ApplicationMetrics
{
    public int ActiveConnections { get; set; }
    public int RequestsPerSecond { get; set; }
    public double AverageResponseTimeMs { get; set; }
    public int ErrorsLastHour { get; set; }
    public long GcTotalMemoryMB { get; set; }
    public int ThreadCount { get; set; }
}

public class ModuleDiagnostics
{
    public string Name { get; set; } = string.Empty;
    public bool IsEnabled { get; set; }
    public string Status { get; set; } = string.Empty;
    public int EntitiesCount { get; set; }
    public DateTime? LastActivity { get; set; }
}

public class ConnectionDiagnostics
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int Latency { get; set; }
    public string? Version { get; set; }
}
