using Onesign.Modules.Deployment.Domain.Enums;

namespace Onesign.Modules.Deployment.Domain.Entities;

public class DeploymentDescriptor
{
    public string EnvironmentId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public EnvironmentType Type { get; set; }
    public string RegionId { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = string.Empty;
    public string LicenseKey { get; set; } = string.Empty;
    public string DatabaseConnectionString { get; set; } = string.Empty;
    public string StorageEndpoint { get; set; } = string.Empty;
    public string SmtpHost { get; set; } = string.Empty;
    public int SmtpPort { get; set; }
    public string ObservabilityEndpoint { get; set; } = string.Empty;
    public string FeaturesJson { get; set; } = "{}";
    public string Version { get; set; } = "1.0.0";
    public Dictionary<string, string> Services { get; set; } = new();
    public Dictionary<string, string> Configuration { get; set; } = new();
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
}
