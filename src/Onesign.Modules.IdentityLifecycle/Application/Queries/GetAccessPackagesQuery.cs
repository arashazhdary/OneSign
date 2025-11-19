using MediatR;
using Onesign.Modules.IdentityLifecycle.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.IdentityLifecycle.Application.Queries;

public class GetAccessPackagesQuery : IRequest<Result<List<AccessPackageDto>>>
{
    public Guid TenantId { get; set; }
}
