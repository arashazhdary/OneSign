using Onesign.Modules.MultiRegion.Domain.Enums;

namespace Onesign.Modules.MultiRegion.Domain.Entities;

public class Region
{
    public string Id { get; set; } = string.Empty; // e.g., "eu-west-1", "us-east-1"
    public string DisplayName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public string EndpointBaseUrl { get; set; } = string.Empty;
    public string DbClusterRef { get; set; } = string.Empty;
    public string StorageClusterRef { get; set; } = string.Empty;
    public RegionStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastHealthCheckAt { get; set; }
}
