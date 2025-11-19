using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.IdentityLifecycle.Application.Commands;

public class DeleteAccessPackageCommand : IRequest<Result>
{
    public Guid TenantId { get; set; }
    public Guid PackageId { get; set; }
}
