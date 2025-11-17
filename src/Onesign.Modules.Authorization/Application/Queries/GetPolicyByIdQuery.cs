using MediatR;
using Onesign.Modules.Authorization.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Authorization.Application.Queries;

public class GetPolicyByIdQuery : IRequest<Result<PolicyDefinitionDto>>
{
    public Guid Id { get; set; }
}
