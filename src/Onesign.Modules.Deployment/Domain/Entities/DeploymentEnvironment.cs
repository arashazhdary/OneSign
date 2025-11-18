using Onesign.Modules.Deployment.Domain.Enums;

namespace Onesign.Modules.Deployment.Domain.Entities;

public class DeploymentEnvironment
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public EnvironmentType Type { get; set; }
    public string RegionId { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = string.Empty;
    public string AppVersion { get; set; } = string.Empty;
    public string DbSchemaVersion { get; set; } = string.Empty;
    public string LicenseKey { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? LastHeartbeatAt { get; set; }
}
