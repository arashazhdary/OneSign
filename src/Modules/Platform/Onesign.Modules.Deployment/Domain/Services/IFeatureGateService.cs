using Onesign.Modules.Deployment.Domain.Entities;

namespace Onesign.Modules.Deployment.Domain.Services;

public interface IFeatureGateService
{
    Task<bool> IsFeatureEnabledAsync(string featureKey, FeatureContext? context = null, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<FeatureGate>> GetAllFeaturesAsync(CancellationToken cancellationToken = default);
    Task<FeatureGate?> GetFeatureAsync(string featureKey, CancellationToken cancellationToken = default);
    Task<FeatureGate> CreateFeatureAsync(CreateFeatureRequest request, CancellationToken cancellationToken = default);
    Task<FeatureGate> UpdateFeatureAsync(string featureKey, UpdateFeatureRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteFeatureAsync(string featureKey, CancellationToken cancellationToken = default);
    Task<bool> ToggleFeatureAsync(string featureKey, bool enabled, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<string>> GetEnabledFeaturesAsync(FeatureContext? context = null, CancellationToken cancellationToken = default);
    Task<FeatureEvaluationResult> EvaluateFeatureAsync(string featureKey, FeatureContext? context = null, CancellationToken cancellationToken = default);
}

public class FeatureContext
{
    public Guid? TenantId { get; set; }
    public Guid? UserId { get; set; }
    public string? UserEmail { get; set; }
    public List<string>? UserRoles { get; set; }
    public Dictionary<string, string>? CustomAttributes { get; set; }
}

public class CreateFeatureRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string FeatureKey { get; set; } = string.Empty;
    public bool IsEnabled { get; set; } = false;
    public FeatureGateType Type { get; set; } = FeatureGateType.Boolean;
    public string? ModuleRequirement { get; set; }
    public LicenseType? MinimumLicenseType { get; set; }
    public List<string>? AllowedTenants { get; set; }
    public List<string>? AllowedUsers { get; set; }
    public int? RolloutPercentage { get; set; }
    public DateTime? EnabledFrom { get; set; }
    public DateTime? EnabledUntil { get; set; }
    public Dictionary<string, string>? Parameters { get; set; }
}

public class UpdateFeatureRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public bool? IsEnabled { get; set; }
    public FeatureGateType? Type { get; set; }
    public string? ModuleRequirement { get; set; }
    public LicenseType? MinimumLicenseType { get; set; }
    public List<string>? AllowedTenants { get; set; }
    public List<string>? AllowedUsers { get; set; }
    public int? RolloutPercentage { get; set; }
    public DateTime? EnabledFrom { get; set; }
    public DateTime? EnabledUntil { get; set; }
    public Dictionary<string, string>? Parameters { get; set; }
}

public class FeatureEvaluationResult
{
    public string FeatureKey { get; set; } = string.Empty;
    public bool IsEnabled { get; set; }
    public string Reason { get; set; } = string.Empty;
    public Dictionary<string, object>? Parameters { get; set; }
}
