using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Deployment.Domain.Entities;
using Onesign.Modules.Deployment.Domain.Services;

namespace Onesign.Modules.Deployment.Infrastructure.Services;

public class LicenseValidator : ILicenseValidator
{
    private readonly ILogger<LicenseValidator> _logger;
    private LicenseKey? _currentLicense;

    public LicenseValidator(ILogger<LicenseValidator> logger)
    {
        _logger = logger;
    }

    public async Task<LicenseValidationResult> ValidateLicenseAsync(string licenseKey, CancellationToken cancellationToken = default)
    {
        var result = new LicenseValidationResult
        {
            LicenseKey = licenseKey,
            ValidationErrors = new List<string>()
        };

        if (string.IsNullOrEmpty(licenseKey))
        {
            result.ValidationErrors.Add("License key is required");
            return await Task.FromResult(result);
        }

        try
        {
            var decoded = DecodeLicenseKey(licenseKey);

            if (!ValidateSignature(decoded))
            {
                result.ValidationErrors.Add("Invalid license signature");
                return result;
            }

            if (decoded.ExpiresAt < DateTime.UtcNow)
            {
                result.ValidationErrors.Add($"License expired on {decoded.ExpiresAt:yyyy-MM-dd}");
            }

            result.IsValid = result.ValidationErrors.Count == 0;
            result.LicenseType = decoded.Type;
            result.CustomerName = decoded.CustomerName;
            result.ExpiresAt = decoded.ExpiresAt;
            result.EnabledFeatures = decoded.EnabledFeatures;
            result.EnabledModules = decoded.EnabledModules;
            result.Limits = new LicenseLimits
            {
                MaxUsers = decoded.MaxUsers,
                MaxApplications = decoded.MaxApplications,
                MaxTenants = GetMaxTenants(decoded.Type),
                MaxApiCallsPerMonth = GetMaxApiCalls(decoded.Type),
                UnlimitedStorage = decoded.Type == LicenseType.Unlimited
            };

            _logger.LogInformation("License validation completed: {Valid} for {CustomerName}",
                result.IsValid, result.CustomerName);
        }
        catch (Exception ex)
        {
            result.ValidationErrors.Add($"License parsing error: {ex.Message}");
            _logger.LogError(ex, "Error validating license");
        }

        return result;
    }

    public async Task<LicenseKey?> GetCurrentLicenseAsync(CancellationToken cancellationToken = default)
    {
        return await Task.FromResult(_currentLicense);
    }

    public async Task<LicenseKey> ActivateLicenseAsync(string licenseKey, CancellationToken cancellationToken = default)
    {
        var validationResult = await ValidateLicenseAsync(licenseKey, cancellationToken);

        if (!validationResult.IsValid)
        {
            throw new InvalidOperationException($"Cannot activate invalid license: {string.Join(", ", validationResult.ValidationErrors)}");
        }

        _currentLicense = DecodeLicenseKey(licenseKey);
        _currentLicense.IsActive = true;
        _currentLicense.LastValidatedAt = DateTime.UtcNow;

        _logger.LogInformation("License activated for {CustomerName}, type: {LicenseType}",
            _currentLicense.CustomerName, _currentLicense.Type);

        return _currentLicense;
    }

    public async Task<bool> DeactivateLicenseAsync(CancellationToken cancellationToken = default)
    {
        if (_currentLicense != null)
        {
            _logger.LogInformation("License deactivated for {CustomerName}", _currentLicense.CustomerName);
            _currentLicense = null;
        }

        return await Task.FromResult(true);
    }

    public async Task<bool> IsFeatureEnabledAsync(string featureName, CancellationToken cancellationToken = default)
    {
        if (_currentLicense == null || !_currentLicense.IsActive)
        {
            return false;
        }

        return await Task.FromResult(
            _currentLicense.EnabledFeatures.Contains(featureName, StringComparer.OrdinalIgnoreCase));
    }

    public async Task<bool> IsModuleEnabledAsync(string moduleName, CancellationToken cancellationToken = default)
    {
        if (_currentLicense == null || !_currentLicense.IsActive)
        {
            return false;
        }

        return await Task.FromResult(
            _currentLicense.EnabledModules.Contains(moduleName, StringComparer.OrdinalIgnoreCase));
    }

    public async Task<LicenseUsageInfo> GetLicenseUsageAsync(CancellationToken cancellationToken = default)
    {
        var maxUsers = _currentLicense?.MaxUsers ?? 10;
        var maxApplications = _currentLicense?.MaxApplications ?? 5;

        var usage = new LicenseUsageInfo
        {
            CurrentUsers = 25,
            MaxUsers = maxUsers,
            CurrentApplications = 3,
            MaxApplications = maxApplications,
            CurrentTenants = 1,
            MaxTenants = GetMaxTenants(_currentLicense?.Type ?? LicenseType.Trial),
            StorageUsedBytes = 1024 * 1024 * 500,
            ApiCallsThisMonth = 15000,
            IsWithinLimits = true,
            Warnings = new List<string>()
        };

        if (usage.CurrentUsers > usage.MaxUsers * 0.8)
        {
            usage.Warnings.Add($"User count ({usage.CurrentUsers}) is approaching the limit ({usage.MaxUsers})");
        }

        usage.IsWithinLimits = usage.CurrentUsers <= usage.MaxUsers &&
                              usage.CurrentApplications <= usage.MaxApplications &&
                              usage.CurrentTenants <= usage.MaxTenants;

        return await Task.FromResult(usage);
    }

    public async Task<bool> CheckLicenseLimitsAsync(LicenseLimitCheck check, CancellationToken cancellationToken = default)
    {
        var usage = await GetLicenseUsageAsync(cancellationToken);

        return check.Type switch
        {
            LicenseLimitType.Users => usage.CurrentUsers + check.RequestedCount <= usage.MaxUsers,
            LicenseLimitType.Applications => usage.CurrentApplications + check.RequestedCount <= usage.MaxApplications,
            LicenseLimitType.Tenants => usage.CurrentTenants + check.RequestedCount <= usage.MaxTenants,
            _ => true
        };
    }

    private LicenseKey DecodeLicenseKey(string licenseKey)
    {
        return new LicenseKey
        {
            Id = Guid.NewGuid(),
            Key = licenseKey,
            CustomerName = "Sample Customer",
            CustomerEmail = "customer@example.com",
            Type = DetermineLicenseType(licenseKey),
            IssuedAt = DateTime.UtcNow.AddYears(-1),
            ExpiresAt = DateTime.UtcNow.AddYears(1),
            MaxUsers = 100,
            MaxApplications = 50,
            EnabledFeatures = new List<string>
            {
                "SSO",
                "MFA",
                "AuditLogs",
                "CustomBranding",
                "APIAccess"
            },
            EnabledModules = new List<string>
            {
                "Identity",
                "Authorization",
                "Audit",
                "Federation",
                "Tenants"
            }
        };
    }

    private bool ValidateSignature(LicenseKey license)
    {
        return true;
    }

    private LicenseType DetermineLicenseType(string licenseKey)
    {
        if (licenseKey.StartsWith("TRIAL", StringComparison.OrdinalIgnoreCase))
            return LicenseType.Trial;
        if (licenseKey.StartsWith("ENT", StringComparison.OrdinalIgnoreCase))
            return LicenseType.Enterprise;
        if (licenseKey.StartsWith("PRO", StringComparison.OrdinalIgnoreCase))
            return LicenseType.Professional;
        if (licenseKey.StartsWith("UNL", StringComparison.OrdinalIgnoreCase))
            return LicenseType.Unlimited;

        return LicenseType.Starter;
    }

    private int GetMaxTenants(LicenseType type)
    {
        return type switch
        {
            LicenseType.Trial => 1,
            LicenseType.Starter => 5,
            LicenseType.Professional => 25,
            LicenseType.Enterprise => 100,
            LicenseType.Unlimited => int.MaxValue,
            _ => 1
        };
    }

    private int GetMaxApiCalls(LicenseType type)
    {
        return type switch
        {
            LicenseType.Trial => 1000,
            LicenseType.Starter => 10000,
            LicenseType.Professional => 100000,
            LicenseType.Enterprise => 1000000,
            LicenseType.Unlimited => int.MaxValue,
            _ => 1000
        };
    }
}
