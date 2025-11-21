using MediatR;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.Billing.Application.Commands;
using Onesign.Modules.Billing.Application.DTOs;
using Onesign.Modules.Billing.Application.Queries;
using Onesign.Modules.Billing.Domain.Enums;

namespace Onesign.Api.Controllers.Global;

[Route("api/global/billing/plans")]
public class BillingPlansController : GlobalControllerBase
{
    private readonly IMediator _mediator;

    public BillingPlansController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<List<PlanDto>>> GetPlans([FromQuery] bool? isActive)
    {
        var query = new GetPlansQuery { IsActive = isActive };
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);

        return Ok(result.Value);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PlanDto>> GetPlan(Guid id)
    {
        var query = new GetPlanByIdQuery { Id = id };
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return NotFound(result.ErrorMessage);

        return Ok(result.Value);
    }

    [HttpPost]
    public async Task<ActionResult<PlanDto>> CreatePlan([FromBody] CreatePlanRequest request)
    {
        var command = new CreatePlanCommand
        {
            Name = request.Name,
            Code = request.Code,
            Type = request.Type,
            IsActive = request.IsActive,
            Features = request.Features
        };

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);

        return CreatedAtAction(nameof(GetPlan), new { id = result.Value!.Id }, result.Value);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<PlanDto>> UpdatePlan(Guid id, [FromBody] UpdatePlanRequest request)
    {
        var command = new UpdatePlanCommand
        {
            Id = id,
            Name = request.Name,
            Code = request.Code,
            Type = request.Type,
            IsActive = request.IsActive,
            Features = request.Features
        };

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);

        return Ok(result.Value);
    }
}

public record CreatePlanRequest(
    string Name,
    string Code,
    PlanType Type,
    bool IsActive,
    List<PlanFeatureDto> Features
);

public record UpdatePlanRequest(
    string Name,
    string Code,
    PlanType Type,
    bool IsActive,
    List<PlanFeatureDto> Features
);
