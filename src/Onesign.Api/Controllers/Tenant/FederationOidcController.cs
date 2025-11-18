using MediatR;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.Federation.Application.Commands;
using Onesign.Modules.Federation.Application.DTOs;
using Onesign.Modules.Federation.Application.Queries;
using Onesign.Modules.Federation.Domain.Enums;

namespace Onesign.Api.Controllers.Tenant;

[Route("api/tenant/federation/oidc")]
public class FederationOidcController : TenantControllerBase
{
    private readonly IMediator _mediator;

    public FederationOidcController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<List<OidcFederationProviderDto>>> GetProviders([FromQuery] Guid tenantId)
    {
        var query = new GetOidcProvidersQuery { TenantId = tenantId };
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);

        return Ok(result.Data);
    }

    [HttpPost]
    public async Task<ActionResult<OidcFederationProviderDto>> CreateProvider(
        [FromQuery] Guid tenantId,
        [FromBody] CreateOidcProviderRequest request)
    {
        var command = new CreateOidcProviderCommand
        {
            TenantId = tenantId,
            Name = request.Name,
            ProviderType = request.ProviderType,
            Authority = request.Authority,
            ClientId = request.ClientId,
            ClientSecret = request.ClientSecret,
            Scopes = request.Scopes
        };

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);

        return CreatedAtAction(nameof(GetProviders), new { tenantId }, result.Data);
    }
}

public record CreateOidcProviderRequest(
    string Name,
    FederationProviderType ProviderType,
    string Authority,
    string ClientId,
    string ClientSecret,
    string Scopes
);
