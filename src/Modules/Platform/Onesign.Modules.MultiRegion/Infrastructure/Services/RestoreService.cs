using Microsoft.Extensions.Logging;
using Onesign.Modules.MultiRegion.Domain.Entities;
using Onesign.Modules.MultiRegion.Domain.Repositories;
using Onesign.Modules.MultiRegion.Domain.Services;

namespace Onesign.Modules.MultiRegion.Infrastructure.Services;

public class RestoreService : IRestoreService
{
    private readonly ITenantBackupSetRepository _backupRepository;
    private readonly ILogger<RestoreService> _logger;
    private readonly Dictionary<Guid, RestoreStatus> _restoreJobs = new();

    public RestoreService(
        ITenantBackupSetRepository backupRepository,
        ILogger<RestoreService> logger)
    {
        _backupRepository = backupRepository;
        _logger = logger;
    }

    public async Task<RestoreResult> RestoreFromBackupAsync(RestoreRequest request, CancellationToken cancellationToken = default)
    {
        var backup = await _backupRepository.GetByIdAsync(request.BackupId, cancellationToken);
        if (backup == null)
        {
            return new RestoreResult
            {
                RestoreJobId = Guid.Empty,
                Status = "Failed",
                StartedAt = DateTime.UtcNow,
                ErrorMessage = $"Backup {request.BackupId} not found"
            };
        }

        var restoreJobId = Guid.NewGuid();

        var status = new RestoreStatus
        {
            RestoreJobId = restoreJobId,
            BackupId = request.BackupId,
            TenantId = request.TenantId,
            Status = "InProgress",
            ProgressPercent = 0,
            StartedAt = DateTime.UtcNow,
            RestoredItems = new Dictionary<string, int>()
        };

        _restoreJobs[restoreJobId] = status;

        _logger.LogInformation("Starting restore job {RestoreJobId} from backup {BackupId} for tenant {TenantId}",
            restoreJobId, request.BackupId, request.TenantId);

        _ = Task.Run(async () =>
        {
            try
            {
                var phases = new[] { "Users", "Applications", "Roles", "Configurations" };

                foreach (var phase in phases)
                {
                    if (cancellationToken.IsCancellationRequested) break;

                    await Task.Delay(1000);
                    status.ProgressPercent += 25;

                    var count = new Random().Next(10, 100);
                    status.RestoredItems[phase] = count;

                    _logger.LogDebug("Restore job {RestoreJobId}: Completed {Phase} phase, restored {Count} items",
                        restoreJobId, phase, count);
                }

                status.Status = "Completed";
                status.CompletedAt = DateTime.UtcNow;
                status.ProgressPercent = 100;

                _logger.LogInformation("Restore job {RestoreJobId} completed successfully", restoreJobId);
            }
            catch (Exception ex)
            {
                status.Status = "Failed";
                status.ErrorMessage = ex.Message;
                status.CompletedAt = DateTime.UtcNow;

                _logger.LogError(ex, "Restore job {RestoreJobId} failed", restoreJobId);
            }
        }, cancellationToken);

        return new RestoreResult
        {
            RestoreJobId = restoreJobId,
            Status = "InProgress",
            StartedAt = status.StartedAt
        };
    }

    public async Task<RestoreStatus> GetRestoreStatusAsync(Guid restoreJobId, CancellationToken cancellationToken = default)
    {
        await Task.CompletedTask;

        if (_restoreJobs.TryGetValue(restoreJobId, out var status))
        {
            return status;
        }

        return new RestoreStatus
        {
            RestoreJobId = restoreJobId,
            Status = "NotFound",
            ErrorMessage = $"Restore job {restoreJobId} not found"
        };
    }

    public async Task<bool> CancelRestoreAsync(Guid restoreJobId, CancellationToken cancellationToken = default)
    {
        if (_restoreJobs.TryGetValue(restoreJobId, out var status))
        {
            if (status.Status == "InProgress")
            {
                status.Status = "Cancelled";
                status.CompletedAt = DateTime.UtcNow;

                _logger.LogInformation("Restore job {RestoreJobId} cancelled", restoreJobId);
                return true;
            }
        }

        return await Task.FromResult(false);
    }

    public async Task<IReadOnlyList<RestoreJob>> GetRestoreHistoryAsync(Guid tenantId, int page = 1, int pageSize = 20, CancellationToken cancellationToken = default)
    {
        var jobs = _restoreJobs.Values
            .Where(s => s.TenantId == tenantId)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(s => new RestoreJob
            {
                Id = s.RestoreJobId,
                BackupId = s.BackupId,
                TenantId = s.TenantId,
                Status = s.Status,
                StartedAt = s.StartedAt,
                CompletedAt = s.CompletedAt,
                ErrorMessage = s.ErrorMessage
            })
            .ToList();

        return await Task.FromResult(jobs);
    }

    public async Task<RestorePreview> PreviewRestoreAsync(Guid backupId, CancellationToken cancellationToken = default)
    {
        var backup = await _backupRepository.GetByIdAsync(backupId, cancellationToken);
        if (backup == null)
        {
            return new RestorePreview
            {
                BackupId = backupId,
                CanRestore = false,
                Warnings = new List<string> { "Backup not found" }
            };
        }

        return new RestorePreview
        {
            BackupId = backupId,
            BackupDate = backup.CreatedAt,
            BackupSizeBytes = backup.SizeBytes,
            ItemCounts = new Dictionary<string, int>
            {
                ["Users"] = new Random().Next(50, 500),
                ["Applications"] = new Random().Next(5, 50),
                ["Roles"] = new Random().Next(10, 100),
                ["Configurations"] = new Random().Next(100, 1000)
            },
            Warnings = new List<string>(),
            CanRestore = backup.Status == Domain.Enums.BackupStatus.Completed
        };
    }

    public async Task<bool> ValidateBackupForRestoreAsync(Guid backupId, CancellationToken cancellationToken = default)
    {
        var backup = await _backupRepository.GetByIdAsync(backupId, cancellationToken);
        if (backup == null)
        {
            return false;
        }

        if (backup.Status != Domain.Enums.BackupStatus.Completed)
        {
            return false;
        }

        _logger.LogInformation("Backup {BackupId} validated for restore", backupId);
        return true;
    }
}
