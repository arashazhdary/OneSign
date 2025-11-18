namespace Onesign.Modules.Deployment.Domain.Entities;

public class EnvironmentFeatureConfig
{
    public Guid Id { get; set; }
    public string EnvironmentId { get; set; } = string.Empty;
    public int MaxTenants { get; set; }
    public int MaxUsers { get; set; }
    public int MaxApplications { get; set; }
    public string EnabledModulesJson { get; set; } = "[]";
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
