namespace Onesign.Modules.MultiRegion.Infrastructure.EfCore.Entities;

public class RegionEntity
{
    public string Id { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public string EndpointBaseUrl { get; set; } = string.Empty;
    public string DbClusterRef { get; set; } = string.Empty;
    public string StorageClusterRef { get; set; } = string.Empty;
    public int Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastHealthCheckAt { get; set; }
}
