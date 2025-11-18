namespace Onesign.Modules.MultiRegion.Infrastructure.EfCore.Entities;

public class TenantDataResidencyEntity
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string DataRegionId { get; set; } = string.Empty;
    public string? BackupRegionId { get; set; }
    public bool CrossRegionReplicationAllowed { get; set; }
    public string? ComplianceTag { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
