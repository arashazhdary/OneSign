using MediatR;
using Onesign.Modules.Federation.Application.DTOs;
using Onesign.Modules.Federation.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Federation.Application.Queries;

public class GetOidcProvidersQueryHandler : IRequestHandler<GetOidcProvidersQuery, Result<List<OidcFederationProviderDto>>>
{
    private readonly IOidcFederationProviderRepository _repository;

    public GetOidcProvidersQueryHandler(IOidcFederationProviderRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<OidcFederationProviderDto>>> Handle(GetOidcProvidersQuery request, CancellationToken cancellationToken)
    {
        var providers = await _repository.GetByTenantIdAsync(request.TenantId, cancellationToken);

        var dtos = providers.Select(p => new OidcFederationProviderDto
        {
            Id = p.Id,
            TenantId = p.TenantId,
            Name = p.Name,
            ProviderType = p.ProviderType,
            Authority = p.Authority,
            ClientId = p.ClientId,
            Scopes = p.Scopes,
            Enabled = p.Enabled,
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt
        }).ToList();

        return Result.Success(dtos);
    }
}
