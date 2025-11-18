using MediatR;
using Onesign.Modules.MultiRegion.Application.Commands;
using Onesign.Modules.MultiRegion.Domain.Entities;
using Onesign.Modules.MultiRegion.Domain.Enums;
using Onesign.Modules.MultiRegion.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.MultiRegion.Application.Handlers;

public class CreateTenantBackupCommandHandler : IRequestHandler<CreateTenantBackupCommand, Result<Guid>>
{
    private readonly ITenantBackupSetRepository _backupRepository;
    private readonly IRegionRepository _regionRepository;

    public CreateTenantBackupCommandHandler(
        ITenantBackupSetRepository backupRepository,
        IRegionRepository regionRepository)
    {
        _backupRepository = backupRepository;
        _regionRepository = regionRepository;
    }

    public async Task<Result<Guid>> Handle(CreateTenantBackupCommand request, CancellationToken cancellationToken)
    {
        // Get the first active region for the backup
        var regions = await _regionRepository.GetActiveAsync(cancellationToken);
        if (!regions.Any())
            return Result.Failure<Guid>("NoActiveRegion", "No active region available for backup");

        var region = regions.First();

        var backup = new TenantBackupSet
        {
            Id = Guid.NewGuid(),
            TenantId = request.TenantId,
            RegionId = region.Id,
            CreatedAt = DateTime.UtcNow,
            BackupType = request.BackupType,
            StorageLocation = $"{region.StorageClusterRef}/backups/{request.TenantId}/{DateTime.UtcNow:yyyyMMddHHmmss}",
            Status = BackupStatus.InProgress,
            SizeBytes = 0
        };

        await _backupRepository.AddAsync(backup, cancellationToken);

        return Result.Success(backup.Id);
    }
}
