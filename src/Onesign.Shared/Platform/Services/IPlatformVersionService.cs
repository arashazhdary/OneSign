using Onesign.Shared.Platform.Entities;

namespace Onesign.Shared.Platform.Services;

public interface IPlatformVersionService
{
    Task<PlatformVersionInfo> GetCurrentVersionAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PlatformVersion>> GetVersionHistoryAsync(CancellationToken cancellationToken = default);
    Task<VersionCompatibility> CheckCompatibilityAsync(string version, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<string>> GetAvailableUpdatesAsync(CancellationToken cancellationToken = default);
}

public class PlatformVersionInfo
{
    public string Version { get; set; } = string.Empty;
    public string BuildNumber { get; set; } = string.Empty;
    public DateTime BuildDate { get; set; }
    public string Environment { get; set; } = string.Empty;
    public string CommitHash { get; set; } = string.Empty;
    public Dictionary<string, string> ModuleVersions { get; set; } = new();
    public RuntimeInfo Runtime { get; set; } = new();
}

public class RuntimeInfo
{
    public string Framework { get; set; } = string.Empty;
    public string FrameworkVersion { get; set; } = string.Empty;
    public string OperatingSystem { get; set; } = string.Empty;
    public string Architecture { get; set; } = string.Empty;
    public int ProcessorCount { get; set; }
    public long TotalMemoryMB { get; set; }
}

public class VersionCompatibility
{
    public bool IsCompatible { get; set; }
    public string TargetVersion { get; set; } = string.Empty;
    public List<string> CompatibilityIssues { get; set; } = new();
    public List<string> RequiredMigrations { get; set; } = new();
    public bool RequiresDowntime { get; set; }
}
