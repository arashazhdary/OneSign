using MediatR;
using Onesign.Modules.Federation.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Federation.Application.Queries;

public class GetSamlProvidersQuery : IRequest<Result<List<SamlProviderDto>>>
{
    public Guid TenantId { get; set; }
}
