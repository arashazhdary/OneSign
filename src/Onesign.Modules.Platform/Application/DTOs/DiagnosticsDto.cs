namespace Onesign.Modules.Platform.Application.DTOs;

public class DiagnosticsDto
{
    public DateTimeOffset GeneratedAt { get; set; }
    public SystemInfoDto SystemInfo { get; set; } = new();
    public MemoryInfoDto Memory { get; set; } = new();
    public CpuInfoDto CPU { get; set; } = new();
    public int ActiveConnections { get; set; }
    public int RequestsPerSecond { get; set; }
    public double AverageResponseTimeMs { get; set; }
    public int ErrorsLastHour { get; set; }
    public int ThreadCount { get; set; }
    public List<ModuleDiagnosticsDto> Modules { get; set; } = new();
    public List<ConnectionDiagnosticsDto> Connections { get; set; } = new();
    public Dictionary<string, string> Configuration { get; set; } = new();
}

public class SystemInfoDto
{
    public string Environment { get; set; } = string.Empty;
    public string MachineName { get; set; } = string.Empty;
    public string OsVersion { get; set; } = string.Empty;
    public int ProcessorCount { get; set; }
    public TimeSpan Uptime { get; set; }
}

public class MemoryInfoDto
{
    public long UsedMB { get; set; }
    public long TotalMB { get; set; }
    public double UsagePercent { get; set; }
    public long GcTotalMemoryMB { get; set; }
}

public class CpuInfoDto
{
    public double UsagePercent { get; set; }
}

public class ModuleDiagnosticsDto
{
    public string Name { get; set; } = string.Empty;
    public bool IsEnabled { get; set; }
    public string Status { get; set; } = string.Empty;
    public int EntitiesCount { get; set; }
    public DateTimeOffset? LastActivity { get; set; }
}

public class ConnectionDiagnosticsDto
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int LatencyMs { get; set; }
    public string? Version { get; set; }
}
