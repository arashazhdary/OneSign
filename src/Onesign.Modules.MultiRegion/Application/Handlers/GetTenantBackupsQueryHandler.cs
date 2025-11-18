using MediatR;
using Onesign.Modules.MultiRegion.Application.DTOs;
using Onesign.Modules.MultiRegion.Application.Queries;
using Onesign.Modules.MultiRegion.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.MultiRegion.Application.Handlers;

public class GetTenantBackupsQueryHandler : IRequestHandler<GetTenantBackupsQuery, Result<List<TenantBackupSetDto>>>
{
    private readonly ITenantBackupSetRepository _repository;

    public GetTenantBackupsQueryHandler(ITenantBackupSetRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<TenantBackupSetDto>>> Handle(GetTenantBackupsQuery request, CancellationToken cancellationToken)
    {
        var backups = await _repository.GetByTenantIdAsync(request.TenantId, cancellationToken);

        var dtos = backups.Select(b => new TenantBackupSetDto
        {
            Id = b.Id,
            TenantId = b.TenantId,
            RegionId = b.RegionId,
            CreatedAt = b.CreatedAt,
            BackupType = b.BackupType,
            StorageLocation = b.StorageLocation,
            Status = b.Status.ToString(),
            SizeBytes = b.SizeBytes,
            CompletedAt = b.CompletedAt,
            ErrorMessage = b.ErrorMessage
        }).ToList();

        return Result.Success(dtos);
    }
}
