using Onesign.Modules.MultiRegion.Domain.Entities;

namespace Onesign.Modules.MultiRegion.Domain.Services;

public interface IBackupService
{
    Task<BackupResult> CreateBackupAsync(BackupRequest request, CancellationToken cancellationToken = default);
    Task<BackupStatus> GetBackupStatusAsync(Guid backupId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TenantBackupSet>> GetBackupsAsync(Guid tenantId, int page = 1, int pageSize = 20, CancellationToken cancellationToken = default);
    Task<bool> DeleteBackupAsync(Guid backupId, CancellationToken cancellationToken = default);
    Task ApplyRetentionPolicyAsync(Guid tenantId, int retentionDays, CancellationToken cancellationToken = default);
    Task<long> GetBackupSizeAsync(Guid backupId, CancellationToken cancellationToken = default);
    Task<bool> VerifyBackupIntegrityAsync(Guid backupId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<BackupSchedule>> GetBackupSchedulesAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<BackupSchedule> CreateBackupScheduleAsync(CreateBackupScheduleRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteBackupScheduleAsync(Guid scheduleId, CancellationToken cancellationToken = default);
}

public class BackupRequest
{
    public Guid TenantId { get; set; }
    public string BackupType { get; set; } = "Full";
    public bool IncludeAuditLogs { get; set; } = true;
    public bool EncryptBackup { get; set; } = true;
    public string? Description { get; set; }
    public Dictionary<string, string>? Metadata { get; set; }
}

public class BackupResult
{
    public Guid BackupId { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime StartedAt { get; set; }
    public string StorageLocation { get; set; } = string.Empty;
    public string? ErrorMessage { get; set; }
}

public class BackupStatus
{
    public Guid BackupId { get; set; }
    public string Status { get; set; } = string.Empty;
    public int ProgressPercent { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public long SizeBytes { get; set; }
    public string? ErrorMessage { get; set; }
}

public class BackupSchedule
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string CronExpression { get; set; } = string.Empty;
    public string BackupType { get; set; } = "Full";
    public int RetentionDays { get; set; } = 30;
    public bool IsEnabled { get; set; } = true;
    public DateTime? LastRunAt { get; set; }
    public DateTime? NextRunAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateBackupScheduleRequest
{
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string CronExpression { get; set; } = string.Empty;
    public string BackupType { get; set; } = "Full";
    public int RetentionDays { get; set; } = 30;
}
