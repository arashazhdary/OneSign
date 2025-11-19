using MediatR;
using Onesign.Modules.Federation.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Federation.Application.Queries;

public class GetOidcProvidersQuery : IRequest<Result<List<OidcFederationProviderDto>>>
{
    public Guid TenantId { get; set; }
}
