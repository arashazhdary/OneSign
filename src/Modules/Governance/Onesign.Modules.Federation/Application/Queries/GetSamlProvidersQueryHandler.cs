using MediatR;
using Onesign.Modules.Federation.Application.DTOs;
using Onesign.Modules.Federation.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Federation.Application.Queries;

public class GetSamlProvidersQueryHandler : IRequestHandler<GetSamlProvidersQuery, Result<List<SamlProviderDto>>>
{
    private readonly ISamlProviderRepository _repository;

    public GetSamlProvidersQueryHandler(ISamlProviderRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<SamlProviderDto>>> Handle(GetSamlProvidersQuery request, CancellationToken cancellationToken)
    {
        var providers = await _repository.GetByTenantIdAsync(request.TenantId, cancellationToken);

        var dtos = providers.Select(p => new SamlProviderDto
        {
            Id = p.Id,
            TenantId = p.TenantId,
            Name = p.Name,
            EntityId = p.EntityId,
            IdpSsoUrl = p.IdpSsoUrl,
            IdpCertificate = p.IdpCertificate,
            SpEntityId = p.SpEntityId,
            SpAssertionConsumerServiceUrl = p.SpAssertionConsumerServiceUrl,
            BindingType = p.BindingType,
            SignAuthRequest = p.SignAuthRequest,
            WantAssertionsSigned = p.WantAssertionsSigned,
            Enabled = p.Enabled,
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt
        }).ToList();

        return Result.Success(dtos);
    }
}
