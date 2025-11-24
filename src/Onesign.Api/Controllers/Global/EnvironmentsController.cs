using MediatR;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.Deployment.Application.Commands;
using Onesign.Modules.Deployment.Application.Queries;
using Onesign.Modules.Deployment.Domain.Enums;

namespace Onesign.Api.Controllers.Global;

/// <summary>
/// Environment registry management (Phase 21)
/// </summary>
[Route("api/global/environments")]
[ApiController]
public class EnvironmentsController : ControllerBase
{
    private readonly IMediator _mediator;

    public EnvironmentsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get all registered environments
    /// </summary>
    [HttpGet]
    public async Task<ActionResult> GetEnvironments(
        [FromQuery] EnvironmentType? type = null,
        [FromQuery] string? regionId = null)
    {
        var query = new GetEnvironmentsQuery
        {
            FilterByType = type,
            FilterByRegionId = regionId
        };

        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get environment by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult> GetEnvironment(string id)
    {
        var query = new GetEnvironmentByIdQuery { EnvironmentId = id };
        var result = await _mediator.Send(query);

        if (result == null)
            return NotFound();

        return Ok(result);
    }

    /// <summary>
    /// Bootstrap a new environment
    /// </summary>
    [HttpPost("bootstrap")]
    public async Task<ActionResult> Bootstrap([FromBody] BootstrapEnvironmentCommand command)
    {
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.ErrorMessage });

        return Ok(new { environmentId = command.EnvironmentId });
    }

    /// <summary>
    /// Update environment heartbeat
    /// </summary>
    [HttpPost("{id}/heartbeat")]
    public async Task<ActionResult> Heartbeat(string id, [FromBody] UpdateEnvironmentHeartbeatCommand command)
    {
        command.EnvironmentId = id;
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.ErrorMessage });

        return Ok();
    }
}
