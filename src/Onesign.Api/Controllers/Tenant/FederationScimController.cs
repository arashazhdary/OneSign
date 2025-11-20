using MediatR;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.Federation.Application.Commands;
using Onesign.Modules.Federation.Application.DTOs;
using Onesign.Modules.Federation.Application.Queries;

namespace Onesign.Api.Controllers.Tenant;

[Route("api/tenant/federation/scim")]
public class FederationScimController : TenantControllerBase
{
    private readonly IMediator _mediator;

    public FederationScimController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("tokens")]
    public async Task<ActionResult<List<ScimTokenDto>>> GetTokens([FromQuery] Guid tenantId)
    {
        var query = new GetScimTokensQuery { TenantId = tenantId };
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);

        return Ok(result.Value);
    }

    [HttpPost("tokens")]
    public async Task<ActionResult<ScimTokenDto>> CreateToken(
        [FromQuery] Guid tenantId,
        [FromBody] CreateScimTokenRequest request)
    {
        var command = new CreateScimTokenCommand
        {
            TenantId = tenantId,
            Name = request.Name,
            ExpiresAt = request.ExpiresAt
        };

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);

        // Return the token with plainToken (only on creation!)
        return CreatedAtAction(nameof(GetTokens), new { tenantId }, result.Value);
    }
}

public record CreateScimTokenRequest(
    string Name,
    DateTime? ExpiresAt
);
