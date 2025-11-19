using MediatR;
using Onesign.Modules.AdaptiveSecurity.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.AdaptiveSecurity.Application.Queries;

public class GetAdaptivePoliciesQuery : IRequest<Result<List<AdaptivePolicyDto>>>
{
    public Guid TenantId { get; set; }
    public bool? EnabledOnly { get; set; }
}
