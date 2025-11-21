using MediatR;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.Authorization.Application.Commands;
using Onesign.Modules.Authorization.Application.DTOs;
using Onesign.Modules.Authorization.Application.Queries;
using Onesign.Modules.Authorization.Domain.Services;

namespace Onesign.Api.Controllers.Tenant;

[Route("api/tenant/policies")]
public class PolicyController : TenantControllerBase
{
    private readonly IMediator _mediator;

    public PolicyController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<List<PolicyDefinitionDto>>> GetPolicies(
        [FromQuery] Guid tenantId,
        [FromQuery] bool? enabled)
    {
        var query = new GetPoliciesQuery
        {
            TenantId = tenantId,
            Enabled = enabled
        };

        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);

        return Ok(result.Value);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PolicyDefinitionDto>> GetPolicyById(Guid id)
    {
        var query = new GetPolicyByIdQuery { Id = id };
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return NotFound(result.ErrorMessage);

        return Ok(result.Value);
    }

    [HttpPost]
    public async Task<ActionResult<PolicyDefinitionDto>> CreatePolicy([FromBody] CreatePolicyCommand command)
    {
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);

        return CreatedAtAction(nameof(GetPolicyById), new { id = result.Value!.Id }, result.Value);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<PolicyDefinitionDto>> UpdatePolicy(Guid id, [FromBody] UpdatePolicyCommand command)
    {
        command.Id = id;
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);

        return Ok(result.Value);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeletePolicy(Guid id)
    {
        var command = new DeletePolicyCommand { Id = id };
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);

        return NoContent();
    }

    [HttpPost("assign")]
    public async Task<ActionResult<Guid>> AssignPolicy([FromBody] AssignPolicyCommand command)
    {
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);

        return Ok(new { assignmentId = result.Value });
    }

    [HttpPost("evaluate")]
    public async Task<ActionResult<PolicyEvaluationResult>> EvaluatePolicy([FromBody] EvaluatePolicyQuery query)
    {
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);

        return Ok(result.Value);
    }
}
