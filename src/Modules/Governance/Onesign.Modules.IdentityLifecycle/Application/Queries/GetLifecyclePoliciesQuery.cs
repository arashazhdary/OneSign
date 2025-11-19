using MediatR;
using Onesign.Modules.IdentityLifecycle.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.IdentityLifecycle.Application.Queries;

public class GetLifecyclePoliciesQuery : IRequest<Result<List<LifecyclePolicyDto>>>
{
    public Guid TenantId { get; set; }
}
