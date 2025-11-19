using Onesign.Modules.MultiRegion.Domain.Enums;

namespace Onesign.Modules.MultiRegion.Domain.Entities;

public class TenantBackupSet
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string RegionId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string BackupType { get; set; } = "LogicalExport"; // LogicalExport, FullTenantBackup
    public string StorageLocation { get; set; } = string.Empty;
    public BackupStatus Status { get; set; }
    public long SizeBytes { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? ErrorMessage { get; set; }
}
