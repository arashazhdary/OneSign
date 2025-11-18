using Onesign.Modules.Deployment.Domain.Entities;

namespace Onesign.Modules.Deployment.Domain.Services;

public interface IDeploymentInitializer
{
    Task<InitializationResult> InitializeEnvironmentAsync(InitializationRequest request, CancellationToken cancellationToken = default);
    Task<InitializationStatus> GetInitializationStatusAsync(Guid initializationId, CancellationToken cancellationToken = default);
    Task<bool> ValidateEnvironmentAsync(CancellationToken cancellationToken = default);
    Task<EnvironmentInfo> GetEnvironmentInfoAsync(CancellationToken cancellationToken = default);
    Task<bool> ResetEnvironmentAsync(ResetOptions options, CancellationToken cancellationToken = default);
    Task ApplyMigrationsAsync(CancellationToken cancellationToken = default);
    Task SeedInitialDataAsync(SeedOptions options, CancellationToken cancellationToken = default);
}

public class InitializationRequest
{
    public string EnvironmentName { get; set; } = string.Empty;
    public string AdminEmail { get; set; } = string.Empty;
    public string AdminPassword { get; set; } = string.Empty;
    public string? LicenseKey { get; set; }
    public string? DatabaseConnectionString { get; set; }
    public Dictionary<string, string>? Configuration { get; set; }
    public bool ApplyMigrations { get; set; } = true;
    public bool SeedData { get; set; } = true;
}

public class InitializationResult
{
    public Guid InitializationId { get; set; }
    public bool Success { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? ErrorMessage { get; set; }
    public List<string> CompletedSteps { get; set; } = new();
    public EnvironmentInfo? EnvironmentInfo { get; set; }
}

public class InitializationStatus
{
    public Guid InitializationId { get; set; }
    public string Status { get; set; } = string.Empty;
    public int ProgressPercent { get; set; }
    public string CurrentStep { get; set; } = string.Empty;
    public List<string> CompletedSteps { get; set; } = new();
    public string? ErrorMessage { get; set; }
}

public class EnvironmentInfo
{
    public string EnvironmentName { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
    public bool IsInitialized { get; set; }
    public DateTime? InitializedAt { get; set; }
    public string DatabaseProvider { get; set; } = string.Empty;
    public string DatabaseVersion { get; set; } = string.Empty;
    public Dictionary<string, string> Configuration { get; set; } = new();
    public List<string> EnabledModules { get; set; } = new();
    public LicenseInfo? License { get; set; }
}

public class LicenseInfo
{
    public string LicenseKey { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public LicenseType Type { get; set; }
    public DateTime ExpiresAt { get; set; }
    public bool IsValid { get; set; }
    public int MaxUsers { get; set; }
    public int MaxApplications { get; set; }
}

public class ResetOptions
{
    public bool DropDatabase { get; set; } = false;
    public bool ClearConfiguration { get; set; } = false;
    public bool PreserveAuditLogs { get; set; } = true;
}

public class SeedOptions
{
    public bool SeedAdminUser { get; set; } = true;
    public bool SeedDefaultRoles { get; set; } = true;
    public bool SeedDefaultPolicies { get; set; } = true;
    public bool SeedSampleData { get; set; } = false;
}
