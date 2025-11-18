namespace Onesign.Modules.Deployment.Infrastructure.EfCore.Entities;

public class DeploymentEnvironmentEntity
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int Type { get; set; }
    public string RegionId { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = string.Empty;
    public string AppVersion { get; set; } = string.Empty;
    public string DbSchemaVersion { get; set; } = string.Empty;
    public string LicenseKey { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? LastHeartbeatAt { get; set; }
}
