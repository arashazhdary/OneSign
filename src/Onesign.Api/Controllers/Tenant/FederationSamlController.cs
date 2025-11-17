using MediatR;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.Federation.Application.Commands;
using Onesign.Modules.Federation.Application.DTOs;
using Onesign.Modules.Federation.Application.Queries;
using Onesign.Modules.Federation.Domain.Enums;

namespace Onesign.Api.Controllers.Tenant;

[Route("api/tenant/federation/saml")]
public class FederationSamlController : TenantControllerBase
{
    private readonly IMediator _mediator;

    public FederationSamlController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<List<SamlProviderDto>>> GetProviders([FromQuery] Guid tenantId)
    {
        var query = new GetSamlProvidersQuery { TenantId = tenantId };
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);

        return Ok(result.Data);
    }

    [HttpPost]
    public async Task<ActionResult<SamlProviderDto>> CreateProvider(
        [FromQuery] Guid tenantId,
        [FromBody] CreateSamlProviderRequest request)
    {
        var command = new CreateSamlProviderCommand
        {
            TenantId = tenantId,
            Name = request.Name,
            EntityId = request.EntityId,
            IdpSsoUrl = request.IdpSsoUrl,
            IdpCertificate = request.IdpCertificate,
            BindingType = request.BindingType,
            SignAuthRequest = request.SignAuthRequest,
            WantAssertionsSigned = request.WantAssertionsSigned
        };

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);

        return CreatedAtAction(nameof(GetProviders), new { tenantId }, result.Data);
    }
}

public record CreateSamlProviderRequest(
    string Name,
    string EntityId,
    string IdpSsoUrl,
    string IdpCertificate,
    SamlBindingType BindingType,
    bool SignAuthRequest,
    bool WantAssertionsSigned
);
