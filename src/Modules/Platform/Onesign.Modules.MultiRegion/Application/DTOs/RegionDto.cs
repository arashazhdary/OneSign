namespace Onesign.Modules.MultiRegion.Application.DTOs;

public class RegionDto
{
    public string Id { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public string EndpointBaseUrl { get; set; } = string.Empty;
    public string DbClusterRef { get; set; } = string.Empty;
    public string StorageClusterRef { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? LastHealthCheckAt { get; set; }
}

public class TenantBackupSetDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string RegionId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string BackupType { get; set; } = string.Empty;
    public string StorageLocation { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public long SizeBytes { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? ErrorMessage { get; set; }
}
