namespace Onesign.Modules.Deployment.Domain.Entities;

public class FeatureGate
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string FeatureKey { get; set; } = string.Empty;
    public bool IsEnabled { get; set; }
    public FeatureGateType Type { get; set; }
    public string? ModuleRequirement { get; set; }
    public LicenseType? MinimumLicenseType { get; set; }
    public List<string>? AllowedTenants { get; set; }
    public List<string>? AllowedUsers { get; set; }
    public int? RolloutPercentage { get; set; }
    public DateTime? EnabledFrom { get; set; }
    public DateTime? EnabledUntil { get; set; }
    public Dictionary<string, string>? Parameters { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public enum FeatureGateType
{
    Boolean,
    Percentage,
    UserList,
    TenantList,
    TimeBased,
    LicenseRequired
}
