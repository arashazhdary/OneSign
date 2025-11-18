namespace Onesign.Modules.MultiRegion.Domain.Entities;

public class TenantDataResidency
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string DataRegionId { get; set; } = string.Empty;
    public string? BackupRegionId { get; set; }
    public bool CrossRegionReplicationAllowed { get; set; }
    public string? ComplianceTag { get; set; } // GDPR, HIPAA, etc.
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
