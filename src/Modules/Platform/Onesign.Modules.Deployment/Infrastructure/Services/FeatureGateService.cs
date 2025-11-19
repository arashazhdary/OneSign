using Microsoft.Extensions.Logging;
using Onesign.Modules.Deployment.Domain.Entities;
using Onesign.Modules.Deployment.Domain.Services;

namespace Onesign.Modules.Deployment.Infrastructure.Services;

public class FeatureGateService : IFeatureGateService
{
    private readonly ILicenseValidator _licenseValidator;
    private readonly ILogger<FeatureGateService> _logger;
    private readonly Dictionary<string, FeatureGate> _features = new();

    public FeatureGateService(
        ILicenseValidator licenseValidator,
        ILogger<FeatureGateService> logger)
    {
        _licenseValidator = licenseValidator;
        _logger = logger;

        InitializeDefaultFeatures();
    }

    public async Task<bool> IsFeatureEnabledAsync(string featureKey, FeatureContext? context = null, CancellationToken cancellationToken = default)
    {
        var result = await EvaluateFeatureAsync(featureKey, context, cancellationToken);
        return result.IsEnabled;
    }

    public async Task<IReadOnlyList<FeatureGate>> GetAllFeaturesAsync(CancellationToken cancellationToken = default)
    {
        return await Task.FromResult(_features.Values.ToList());
    }

    public async Task<FeatureGate?> GetFeatureAsync(string featureKey, CancellationToken cancellationToken = default)
    {
        _features.TryGetValue(featureKey, out var feature);
        return await Task.FromResult(feature);
    }

    public async Task<FeatureGate> CreateFeatureAsync(CreateFeatureRequest request, CancellationToken cancellationToken = default)
    {
        if (_features.ContainsKey(request.FeatureKey))
        {
            throw new InvalidOperationException($"Feature with key '{request.FeatureKey}' already exists");
        }

        var feature = new FeatureGate
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            FeatureKey = request.FeatureKey,
            IsEnabled = request.IsEnabled,
            Type = request.Type,
            ModuleRequirement = request.ModuleRequirement,
            MinimumLicenseType = request.MinimumLicenseType,
            AllowedTenants = request.AllowedTenants,
            AllowedUsers = request.AllowedUsers,
            RolloutPercentage = request.RolloutPercentage,
            EnabledFrom = request.EnabledFrom,
            EnabledUntil = request.EnabledUntil,
            Parameters = request.Parameters,
            CreatedAt = DateTime.UtcNow
        };

        _features[request.FeatureKey] = feature;

        _logger.LogInformation("Created feature gate: {FeatureKey}", request.FeatureKey);

        return await Task.FromResult(feature);
    }

    public async Task<FeatureGate> UpdateFeatureAsync(string featureKey, UpdateFeatureRequest request, CancellationToken cancellationToken = default)
    {
        if (!_features.TryGetValue(featureKey, out var feature))
        {
            throw new InvalidOperationException($"Feature with key '{featureKey}' not found");
        }

        if (request.Name != null) feature.Name = request.Name;
        if (request.Description != null) feature.Description = request.Description;
        if (request.IsEnabled.HasValue) feature.IsEnabled = request.IsEnabled.Value;
        if (request.Type.HasValue) feature.Type = request.Type.Value;
        if (request.ModuleRequirement != null) feature.ModuleRequirement = request.ModuleRequirement;
        if (request.MinimumLicenseType.HasValue) feature.MinimumLicenseType = request.MinimumLicenseType.Value;
        if (request.AllowedTenants != null) feature.AllowedTenants = request.AllowedTenants;
        if (request.AllowedUsers != null) feature.AllowedUsers = request.AllowedUsers;
        if (request.RolloutPercentage.HasValue) feature.RolloutPercentage = request.RolloutPercentage.Value;
        if (request.EnabledFrom.HasValue) feature.EnabledFrom = request.EnabledFrom.Value;
        if (request.EnabledUntil.HasValue) feature.EnabledUntil = request.EnabledUntil.Value;
        if (request.Parameters != null) feature.Parameters = request.Parameters;

        feature.UpdatedAt = DateTime.UtcNow;

        _logger.LogInformation("Updated feature gate: {FeatureKey}", featureKey);

        return await Task.FromResult(feature);
    }

    public async Task<bool> DeleteFeatureAsync(string featureKey, CancellationToken cancellationToken = default)
    {
        var removed = _features.Remove(featureKey);

        if (removed)
        {
            _logger.LogInformation("Deleted feature gate: {FeatureKey}", featureKey);
        }

        return await Task.FromResult(removed);
    }

    public async Task<bool> ToggleFeatureAsync(string featureKey, bool enabled, CancellationToken cancellationToken = default)
    {
        if (!_features.TryGetValue(featureKey, out var feature))
        {
            return false;
        }

        feature.IsEnabled = enabled;
        feature.UpdatedAt = DateTime.UtcNow;

        _logger.LogInformation("Toggled feature gate {FeatureKey} to {Enabled}", featureKey, enabled);

        return await Task.FromResult(true);
    }

    public async Task<IReadOnlyList<string>> GetEnabledFeaturesAsync(FeatureContext? context = null, CancellationToken cancellationToken = default)
    {
        var enabledFeatures = new List<string>();

        foreach (var feature in _features.Values)
        {
            var result = await EvaluateFeatureAsync(feature.FeatureKey, context, cancellationToken);
            if (result.IsEnabled)
            {
                enabledFeatures.Add(feature.FeatureKey);
            }
        }

        return enabledFeatures;
    }

    public async Task<FeatureEvaluationResult> EvaluateFeatureAsync(string featureKey, FeatureContext? context = null, CancellationToken cancellationToken = default)
    {
        var result = new FeatureEvaluationResult
        {
            FeatureKey = featureKey,
            IsEnabled = false,
            Reason = "Feature not found"
        };

        if (!_features.TryGetValue(featureKey, out var feature))
        {
            return result;
        }

        if (!feature.IsEnabled)
        {
            result.Reason = "Feature is disabled";
            return result;
        }

        if (feature.EnabledFrom.HasValue && DateTime.UtcNow < feature.EnabledFrom.Value)
        {
            result.Reason = $"Feature not yet enabled (starts {feature.EnabledFrom.Value:yyyy-MM-dd})";
            return result;
        }

        if (feature.EnabledUntil.HasValue && DateTime.UtcNow > feature.EnabledUntil.Value)
        {
            result.Reason = $"Feature has expired (ended {feature.EnabledUntil.Value:yyyy-MM-dd})";
            return result;
        }

        if (feature.MinimumLicenseType.HasValue)
        {
            var license = await _licenseValidator.GetCurrentLicenseAsync(cancellationToken);
            if (license == null || license.Type < feature.MinimumLicenseType.Value)
            {
                result.Reason = $"Requires {feature.MinimumLicenseType.Value} license or higher";
                return result;
            }
        }

        if (!string.IsNullOrEmpty(feature.ModuleRequirement))
        {
            var moduleEnabled = await _licenseValidator.IsModuleEnabledAsync(feature.ModuleRequirement, cancellationToken);
            if (!moduleEnabled)
            {
                result.Reason = $"Requires {feature.ModuleRequirement} module";
                return result;
            }
        }

        if (context != null)
        {
            if (feature.AllowedTenants != null && feature.AllowedTenants.Any())
            {
                if (context.TenantId == null || !feature.AllowedTenants.Contains(context.TenantId.Value.ToString()))
                {
                    result.Reason = "Tenant not in allowed list";
                    return result;
                }
            }

            if (feature.AllowedUsers != null && feature.AllowedUsers.Any())
            {
                var userId = context.UserId?.ToString() ?? context.UserEmail;
                if (userId == null || !feature.AllowedUsers.Contains(userId))
                {
                    result.Reason = "User not in allowed list";
                    return result;
                }
            }

            if (feature.RolloutPercentage.HasValue && feature.RolloutPercentage < 100)
            {
                var hash = (context.UserId?.GetHashCode() ?? context.UserEmail?.GetHashCode() ?? 0) % 100;
                if (Math.Abs(hash) >= feature.RolloutPercentage.Value)
                {
                    result.Reason = $"Not included in {feature.RolloutPercentage}% rollout";
                    return result;
                }
            }
        }

        result.IsEnabled = true;
        result.Reason = "Feature enabled";
        result.Parameters = feature.Parameters?.ToDictionary(kvp => kvp.Key, kvp => (object)kvp.Value);

        return result;
    }

    private void InitializeDefaultFeatures()
    {
        var defaultFeatures = new[]
        {
            new FeatureGate
            {
                Id = Guid.NewGuid(),
                Name = "Dark Mode",
                Description = "Enable dark mode theme",
                FeatureKey = "dark-mode",
                IsEnabled = true,
                Type = FeatureGateType.Boolean,
                CreatedAt = DateTime.UtcNow
            },
            new FeatureGate
            {
                Id = Guid.NewGuid(),
                Name = "Advanced Analytics",
                Description = "Enable advanced analytics dashboard",
                FeatureKey = "advanced-analytics",
                IsEnabled = true,
                Type = FeatureGateType.LicenseRequired,
                MinimumLicenseType = LicenseType.Professional,
                CreatedAt = DateTime.UtcNow
            },
            new FeatureGate
            {
                Id = Guid.NewGuid(),
                Name = "Beta Features",
                Description = "Access to beta features",
                FeatureKey = "beta-features",
                IsEnabled = true,
                Type = FeatureGateType.Percentage,
                RolloutPercentage = 10,
                CreatedAt = DateTime.UtcNow
            }
        };

        foreach (var feature in defaultFeatures)
        {
            _features[feature.FeatureKey] = feature;
        }
    }
}
