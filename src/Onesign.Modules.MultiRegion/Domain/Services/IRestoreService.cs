using Onesign.Modules.MultiRegion.Domain.Entities;

namespace Onesign.Modules.MultiRegion.Domain.Services;

public interface IRestoreService
{
    Task<RestoreResult> RestoreFromBackupAsync(RestoreRequest request, CancellationToken cancellationToken = default);
    Task<RestoreStatus> GetRestoreStatusAsync(Guid restoreJobId, CancellationToken cancellationToken = default);
    Task<bool> CancelRestoreAsync(Guid restoreJobId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<RestoreJob>> GetRestoreHistoryAsync(Guid tenantId, int page = 1, int pageSize = 20, CancellationToken cancellationToken = default);
    Task<RestorePreview> PreviewRestoreAsync(Guid backupId, CancellationToken cancellationToken = default);
    Task<bool> ValidateBackupForRestoreAsync(Guid backupId, CancellationToken cancellationToken = default);
}

public class RestoreRequest
{
    public Guid BackupId { get; set; }
    public Guid TenantId { get; set; }
    public string? TargetRegionId { get; set; }
    public bool OverwriteExisting { get; set; } = false;
    public bool RestoreToNewTenant { get; set; } = false;
    public string? NewTenantName { get; set; }
    public RestoreOptions Options { get; set; } = new();
}

public class RestoreOptions
{
    public bool IncludeUsers { get; set; } = true;
    public bool IncludeApplications { get; set; } = true;
    public bool IncludeRoles { get; set; } = true;
    public bool IncludeAuditLogs { get; set; } = false;
    public bool IncludeConfigurations { get; set; } = true;
}

public class RestoreResult
{
    public Guid RestoreJobId { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime StartedAt { get; set; }
    public string? ErrorMessage { get; set; }
}

public class RestoreStatus
{
    public Guid RestoreJobId { get; set; }
    public Guid BackupId { get; set; }
    public Guid TenantId { get; set; }
    public string Status { get; set; } = string.Empty;
    public int ProgressPercent { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? ErrorMessage { get; set; }
    public Dictionary<string, int> RestoredItems { get; set; } = new();
}

public class RestoreJob
{
    public Guid Id { get; set; }
    public Guid BackupId { get; set; }
    public Guid TenantId { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? InitiatedBy { get; set; }
    public string? ErrorMessage { get; set; }
}

public class RestorePreview
{
    public Guid BackupId { get; set; }
    public DateTime BackupDate { get; set; }
    public long BackupSizeBytes { get; set; }
    public Dictionary<string, int> ItemCounts { get; set; } = new();
    public List<string> Warnings { get; set; } = new();
    public bool CanRestore { get; set; }
}
