using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.IdentityLifecycle.Application.Commands;

public class DeleteLifecyclePolicyCommand : IRequest<Result>
{
    public Guid TenantId { get; set; }
    public Guid PolicyId { get; set; }
}
