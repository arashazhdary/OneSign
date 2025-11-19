using MediatR;
using Onesign.Modules.MultiRegion.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.MultiRegion.Application.Queries;

public class GetTenantBackupsQuery : IRequest<Result<List<TenantBackupSetDto>>>
{
    public Guid TenantId { get; set; }
}
