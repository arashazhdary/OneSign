using MediatR;
using Onesign.Modules.MultiRegion.Domain.Services;
using Onesign.Shared.Result;

namespace Onesign.Modules.MultiRegion.Application.Commands;

public class RestoreTenantFromBackupCommand : IRequest<Result<RestoreResult>>
{
    public Guid BackupId { get; set; }
    public Guid TenantId { get; set; }
    public string? TargetRegionId { get; set; }
    public bool OverwriteExisting { get; set; } = false;
    public RestoreOptions Options { get; set; } = new();
}

public class RestoreTenantFromBackupCommandHandler : IRequestHandler<RestoreTenantFromBackupCommand, Result<RestoreResult>>
{
    private readonly IRestoreService _restoreService;

    public RestoreTenantFromBackupCommandHandler(IRestoreService restoreService)
    {
        _restoreService = restoreService;
    }

    public async Task<Result<RestoreResult>> Handle(RestoreTenantFromBackupCommand request, CancellationToken cancellationToken)
    {
        var isValid = await _restoreService.ValidateBackupForRestoreAsync(request.BackupId, cancellationToken);
        if (!isValid)
        {
            return Result.Failure<RestoreResult>("InvalidBackup", "Backup is not valid for restore");
        }

        var restoreRequest = new RestoreRequest
        {
            BackupId = request.BackupId,
            TenantId = request.TenantId,
            TargetRegionId = request.TargetRegionId,
            OverwriteExisting = request.OverwriteExisting,
            Options = request.Options
        };

        var result = await _restoreService.RestoreFromBackupAsync(restoreRequest, cancellationToken);

        if (result.RestoreJobId == Guid.Empty)
        {
            return Result.Failure<RestoreResult>("RestoreFailed", result.ErrorMessage);
        }

        return Result.Success(result);
    }
}
