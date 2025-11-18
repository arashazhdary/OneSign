using MediatR;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Federation.Application.DTOs;
using Onesign.Modules.Federation.Domain.Entities;
using Onesign.Modules.Federation.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Federation.Application.Commands;

public class CreateSamlProviderCommandHandler : IRequestHandler<CreateSamlProviderCommand, Result<SamlProviderDto>>
{
    private readonly ISamlProviderRepository _repository;
    private readonly ILogger<CreateSamlProviderCommandHandler> _logger;

    public CreateSamlProviderCommandHandler(
        ISamlProviderRepository repository,
        ILogger<CreateSamlProviderCommandHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<Result<SamlProviderDto>> Handle(CreateSamlProviderCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating SAML provider for tenant {TenantId}", request.TenantId);

        try
        {
            // Check if EntityId already exists for this tenant
            var existing = await _repository.GetByEntityIdAsync(request.TenantId, request.EntityId, cancellationToken);
            if (existing != null)
            {
                return Result.Failure<SamlProviderDto>("SAML_ENTITY_ID_EXISTS", "A SAML provider with this Entity ID already exists");
            }

            var provider = new SamlProvider
            {
                Id = Guid.NewGuid(),
                TenantId = request.TenantId,
                Name = request.Name,
                EntityId = request.EntityId,
                IdpSsoUrl = request.IdpSsoUrl,
                IdpCertificate = request.IdpCertificate,
                SpEntityId = $"onesign:{request.TenantId}:saml",
                SpAssertionConsumerServiceUrl = $"https://login.onesign.com/saml/acs/{request.TenantId}",
                BindingType = request.BindingType,
                SignAuthRequest = request.SignAuthRequest,
                WantAssertionsSigned = request.WantAssertionsSigned,
                Enabled = true,
                CreatedAt = DateTime.UtcNow
            };

            var created = await _repository.AddAsync(provider, cancellationToken);

            var dto = new SamlProviderDto
            {
                Id = created.Id,
                TenantId = created.TenantId,
                Name = created.Name,
                EntityId = created.EntityId,
                IdpSsoUrl = created.IdpSsoUrl,
                IdpCertificate = created.IdpCertificate,
                SpEntityId = created.SpEntityId,
                SpAssertionConsumerServiceUrl = created.SpAssertionConsumerServiceUrl,
                BindingType = created.BindingType,
                SignAuthRequest = created.SignAuthRequest,
                WantAssertionsSigned = created.WantAssertionsSigned,
                Enabled = created.Enabled,
                CreatedAt = created.CreatedAt,
                UpdatedAt = created.UpdatedAt
            };

            return Result.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating SAML provider");
            return Result.Failure<SamlProviderDto>("SAML_PROVIDER_CREATE_FAILED", ex.Message);
        }
    }
}
