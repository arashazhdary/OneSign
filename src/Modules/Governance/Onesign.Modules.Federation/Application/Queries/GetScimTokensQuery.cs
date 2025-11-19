using MediatR;
using Onesign.Modules.Federation.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Federation.Application.Queries;

public class GetScimTokensQuery : IRequest<Result<List<ScimTokenDto>>>
{
    public Guid TenantId { get; set; }
}
