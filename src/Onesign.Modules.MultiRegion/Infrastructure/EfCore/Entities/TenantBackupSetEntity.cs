namespace Onesign.Modules.MultiRegion.Infrastructure.EfCore.Entities;

public class TenantBackupSetEntity
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string RegionId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string BackupType { get; set; } = "LogicalExport";
    public string StorageLocation { get; set; } = string.Empty;
    public int Status { get; set; }
    public long SizeBytes { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? ErrorMessage { get; set; }
}
