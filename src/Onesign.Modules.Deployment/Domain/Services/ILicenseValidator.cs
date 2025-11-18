using Onesign.Modules.Deployment.Domain.Entities;

namespace Onesign.Modules.Deployment.Domain.Services;

public interface ILicenseValidator
{
    Task<LicenseValidationResult> ValidateLicenseAsync(string licenseKey, CancellationToken cancellationToken = default);
    Task<LicenseKey?> GetCurrentLicenseAsync(CancellationToken cancellationToken = default);
    Task<LicenseKey> ActivateLicenseAsync(string licenseKey, CancellationToken cancellationToken = default);
    Task<bool> DeactivateLicenseAsync(CancellationToken cancellationToken = default);
    Task<bool> IsFeatureEnabledAsync(string featureName, CancellationToken cancellationToken = default);
    Task<bool> IsModuleEnabledAsync(string moduleName, CancellationToken cancellationToken = default);
    Task<LicenseUsageInfo> GetLicenseUsageAsync(CancellationToken cancellationToken = default);
    Task<bool> CheckLicenseLimitsAsync(LicenseLimitCheck check, CancellationToken cancellationToken = default);
}

public class LicenseValidationResult
{
    public bool IsValid { get; set; }
    public string LicenseKey { get; set; } = string.Empty;
    public LicenseType? LicenseType { get; set; }
    public string? CustomerName { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public List<string> EnabledFeatures { get; set; } = new();
    public List<string> EnabledModules { get; set; } = new();
    public List<string> ValidationErrors { get; set; } = new();
    public LicenseLimits? Limits { get; set; }
}

public class LicenseLimits
{
    public int MaxUsers { get; set; }
    public int MaxApplications { get; set; }
    public int MaxTenants { get; set; }
    public int MaxApiCallsPerMonth { get; set; }
    public bool UnlimitedStorage { get; set; }
}

public class LicenseUsageInfo
{
    public int CurrentUsers { get; set; }
    public int MaxUsers { get; set; }
    public int CurrentApplications { get; set; }
    public int MaxApplications { get; set; }
    public int CurrentTenants { get; set; }
    public int MaxTenants { get; set; }
    public long StorageUsedBytes { get; set; }
    public int ApiCallsThisMonth { get; set; }
    public bool IsWithinLimits { get; set; }
    public List<string> Warnings { get; set; } = new();
}

public class LicenseLimitCheck
{
    public LicenseLimitType Type { get; set; }
    public int RequestedCount { get; set; } = 1;
}

public enum LicenseLimitType
{
    Users,
    Applications,
    Tenants,
    ApiCalls,
    Storage
}
