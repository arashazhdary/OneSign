using MediatR;
using Onesign.Modules.MultiRegion.Domain.Entities;
using Onesign.Modules.MultiRegion.Domain.Services;
using Onesign.Shared.Result;

namespace Onesign.Modules.MultiRegion.Application.Queries;

public class GetBackupSetsQuery : IRequest<Result<IReadOnlyList<TenantBackupSet>>>
{
    public Guid TenantId { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class GetBackupSetsQueryHandler : IRequestHandler<GetBackupSetsQuery, Result<IReadOnlyList<TenantBackupSet>>>
{
    private readonly IBackupService _backupService;

    public GetBackupSetsQueryHandler(IBackupService backupService)
    {
        _backupService = backupService;
    }

    public async Task<Result<IReadOnlyList<TenantBackupSet>>> Handle(GetBackupSetsQuery request, CancellationToken cancellationToken)
    {
        var backups = await _backupService.GetBackupsAsync(request.TenantId, request.Page, request.PageSize, cancellationToken);
        return Result.Success(backups);
    }
}
