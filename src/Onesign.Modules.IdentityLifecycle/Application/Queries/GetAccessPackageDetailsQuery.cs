using MediatR;
using Onesign.Modules.IdentityLifecycle.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.IdentityLifecycle.Application.Queries;

public class GetAccessPackageDetailsQuery : IRequest<Result<AccessPackageDto>>
{
    public Guid TenantId { get; set; }
    public Guid PackageId { get; set; }
}
