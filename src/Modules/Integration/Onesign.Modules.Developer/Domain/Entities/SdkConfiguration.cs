using Onesign.Modules.Developer.Domain.Enums;

namespace Onesign.Modules.Developer.Domain.Entities;

public class SdkConfiguration
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public SdkType SdkType { get; set; }
    public string Version { get; set; } = string.Empty;
    public string ConfigurationJson { get; set; } = string.Empty; // JSON configuration
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
