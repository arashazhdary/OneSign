using MediatR;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.Crypto.Application.Commands;
using Onesign.Modules.Crypto.Application.Queries;

namespace Onesign.Api.Controllers.Global;

/// <summary>
/// Crypto key management (Phase 22)
/// </summary>
[Route("api/global/crypto")]
[ApiController]
public class CryptoController : ControllerBase
{
    private readonly IMediator _mediator;

    public CryptoController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get all keysets
    /// </summary>
    [HttpGet("keysets")]
    public async Task<ActionResult> GetKeySets()
    {
        var query = new GetKeySetsQuery();
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get keyset by ID with versions
    /// </summary>
    [HttpGet("keysets/{id:guid}")]
    public async Task<ActionResult> GetKeySet(Guid id)
    {
        var query = new GetKeySetByIdQuery { KeySetId = id };
        var result = await _mediator.Send(query);

        if (result == null)
            return NotFound();

        return Ok(result);
    }

    /// <summary>
    /// Manual key rollover
    /// </summary>
    [HttpPost("keysets/{id:guid}/rollover")]
    public async Task<ActionResult> Rollover(Guid id)
    {
        var command = new RolloverKeyCommand { KeySetId = id };
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.ErrorMessage });

        return Ok(result.Value);
    }

    /// <summary>
    /// Revoke a key version
    /// </summary>
    [HttpPost("keyversions/{id:guid}/revoke")]
    public async Task<ActionResult> Revoke(Guid id, [FromQuery] bool autoCreateNew = true)
    {
        var command = new RevokeKeyVersionCommand
        {
            KeyVersionId = id,
            Reason = autoCreateNew ? "Auto-rotation requested" : "Manual revocation"
        };
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.ErrorMessage });

        return Ok();
    }

    /// <summary>
    /// Get rotation policies
    /// </summary>
    [HttpGet("rotation-policies")]
    public async Task<ActionResult> GetRotationPolicies()
    {
        var query = new GetRotationPoliciesQuery();
        var result = await _mediator.Send(query);
        return Ok(result);
    }
}
