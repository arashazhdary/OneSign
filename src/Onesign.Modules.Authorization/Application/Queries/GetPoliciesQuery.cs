using MediatR;
using Onesign.Modules.Authorization.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Authorization.Application.Queries;

public class GetPoliciesQuery : IRequest<Result<List<PolicyDefinitionDto>>>
{
    public Guid TenantId { get; set; }
    public bool? Enabled { get; set; }
}
