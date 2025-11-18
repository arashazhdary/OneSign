using MediatR;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Federation.Application.DTOs;
using Onesign.Modules.Federation.Domain.Entities;
using Onesign.Modules.Federation.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Federation.Application.Commands;

public class CreateOidcProviderCommandHandler : IRequestHandler<CreateOidcProviderCommand, Result<OidcFederationProviderDto>>
{
    private readonly IOidcFederationProviderRepository _repository;
    private readonly ILogger<CreateOidcProviderCommandHandler> _logger;

    public CreateOidcProviderCommandHandler(
        IOidcFederationProviderRepository repository,
        ILogger<CreateOidcProviderCommandHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<Result<OidcFederationProviderDto>> Handle(CreateOidcProviderCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating OIDC federation provider for tenant {TenantId}", request.TenantId);

        try
        {
            var provider = new OidcFederationProvider
            {
                Id = Guid.NewGuid(),
                TenantId = request.TenantId,
                Name = request.Name,
                ProviderType = request.ProviderType,
                Authority = request.Authority,
                ClientId = request.ClientId,
                ClientSecret = request.ClientSecret,
                Scopes = request.Scopes,
                Enabled = true,
                CreatedAt = DateTime.UtcNow
            };

            var created = await _repository.AddAsync(provider, cancellationToken);

            var dto = new OidcFederationProviderDto
            {
                Id = created.Id,
                TenantId = created.TenantId,
                Name = created.Name,
                ProviderType = created.ProviderType,
                Authority = created.Authority,
                ClientId = created.ClientId,
                Scopes = created.Scopes,
                Enabled = created.Enabled,
                CreatedAt = created.CreatedAt,
                UpdatedAt = created.UpdatedAt
            };

            return Result.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating OIDC provider");
            return Result.Failure<OidcFederationProviderDto>("OIDC_PROVIDER_CREATE_FAILED", ex.Message);
        }
    }
}
