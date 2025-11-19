using System.Reflection;
using System.Runtime.InteropServices;
using Microsoft.Extensions.Logging;
using Onesign.Shared.Platform.Entities;

namespace Onesign.Shared.Platform.Services.Implementations;

public class PlatformVersionService : IPlatformVersionService
{
    private readonly ILogger<PlatformVersionService> _logger;

    public PlatformVersionService(ILogger<PlatformVersionService> logger)
    {
        _logger = logger;
    }

    public async Task<PlatformVersionInfo> GetCurrentVersionAsync(CancellationToken cancellationToken = default)
    {
        var assembly = Assembly.GetExecutingAssembly();
        var version = assembly.GetName().Version?.ToString() ?? "1.0.0";

        var versionInfo = new PlatformVersionInfo
        {
            Version = version,
            BuildNumber = Environment.GetEnvironmentVariable("BUILD_NUMBER") ?? "local",
            BuildDate = File.GetLastWriteTimeUtc(assembly.Location),
            Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production",
            CommitHash = Environment.GetEnvironmentVariable("GIT_COMMIT") ?? "unknown",
            ModuleVersions = new Dictionary<string, string>
            {
                ["Identity"] = "1.0.0",
                ["Authorization"] = "1.0.0",
                ["Audit"] = "1.0.0",
                ["Applications"] = "1.0.0",
                ["Tenants"] = "1.0.0",
                ["Federation"] = "1.0.0",
                ["MultiRegion"] = "1.0.0",
                ["Deployment"] = "1.0.0",
                ["Governance"] = "1.0.0",
                ["Privacy"] = "1.0.0",
                ["Observability"] = "1.0.0",
                ["NotificationCenter"] = "1.0.0"
            },
            Runtime = new RuntimeInfo
            {
                Framework = RuntimeInformation.FrameworkDescription,
                FrameworkVersion = Environment.Version.ToString(),
                OperatingSystem = RuntimeInformation.OSDescription,
                Architecture = RuntimeInformation.OSArchitecture.ToString(),
                ProcessorCount = Environment.ProcessorCount,
                TotalMemoryMB = GC.GetGCMemoryInfo().TotalAvailableMemoryBytes / (1024 * 1024)
            }
        };

        _logger.LogDebug("Retrieved platform version: {Version}", versionInfo.Version);

        return await Task.FromResult(versionInfo);
    }

    public async Task<IReadOnlyList<PlatformVersion>> GetVersionHistoryAsync(CancellationToken cancellationToken = default)
    {
        var history = new List<PlatformVersion>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Version = "1.0.0",
                ReleaseNotes = "Initial release of OneSign Identity Platform",
                ReleasedAt = DateTime.UtcNow.AddMonths(-1),
                IsCurrent = true,
                NewFeatures = new List<string>
                {
                    "Complete identity management",
                    "Multi-tenant support",
                    "OAuth 2.0/OIDC support",
                    "SAML federation",
                    "Role-based access control"
                },
                BugFixes = new List<string>(),
                BreakingChanges = new List<string>()
            }
        };

        return await Task.FromResult(history);
    }

    public async Task<VersionCompatibility> CheckCompatibilityAsync(string version, CancellationToken cancellationToken = default)
    {
        var currentVersion = await GetCurrentVersionAsync(cancellationToken);

        var targetVersion = Version.Parse(version.TrimStart('v'));
        var current = Version.Parse(currentVersion.Version);

        var compatibility = new VersionCompatibility
        {
            TargetVersion = version,
            IsCompatible = targetVersion >= current,
            CompatibilityIssues = new List<string>(),
            RequiredMigrations = new List<string>(),
            RequiresDowntime = false
        };

        if (targetVersion.Major > current.Major)
        {
            compatibility.RequiresDowntime = true;
            compatibility.CompatibilityIssues.Add("Major version upgrade requires downtime");
        }

        return compatibility;
    }

    public async Task<IReadOnlyList<string>> GetAvailableUpdatesAsync(CancellationToken cancellationToken = default)
    {
        return await Task.FromResult(new List<string>());
    }
}
