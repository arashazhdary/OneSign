using MediatR;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.Billing.Application.Commands;
using Onesign.Modules.Billing.Application.DTOs;
using Onesign.Modules.Billing.Application.Queries;
using Onesign.Modules.Billing.Domain.Enums;

namespace Onesign.Api.Controllers.Global;

[Route("api/global/billing/tenants")]
public class BillingTenantsController : GlobalControllerBase
{
    private readonly IMediator _mediator;

    public BillingTenantsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{tenantId}/subscription")]
    public async Task<ActionResult<TenantSubscriptionDto>> GetTenantSubscription(Guid tenantId)
    {
        var query = new GetTenantSubscriptionQuery { TenantId = tenantId };
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return NotFound(result.ErrorMessage);

        return Ok(result.Value);
    }

    [HttpPost("{tenantId}/subscription")]
    public async Task<ActionResult<TenantSubscriptionDto>> AssignSubscription(
        Guid tenantId,
        [FromBody] AssignSubscriptionRequest request)
    {
        var command = new AssignSubscriptionToTenantCommand
        {
            TenantId = tenantId,
            PlanId = request.PlanId,
            Status = request.Status,
            TrialEndsAt = request.TrialEndsAt,
            CurrentPeriodEndsAt = request.CurrentPeriodEndsAt
        };

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);

        return CreatedAtAction(nameof(GetTenantSubscription), new { tenantId }, result.Value);
    }

    [HttpPut("{tenantId}/subscription/plan")]
    public async Task<ActionResult<TenantSubscriptionDto>> ChangePlan(
        Guid tenantId,
        [FromBody] ChangePlanRequest request)
    {
        var command = new ChangeTenantPlanCommand
        {
            TenantId = tenantId,
            NewPlanId = request.NewPlanId
        };

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);

        return Ok(result.Value);
    }

    [HttpGet("{tenantId}/usage")]
    public async Task<ActionResult<TenantUsageSummaryDto>> GetTenantUsage(Guid tenantId)
    {
        var query = new GetTenantUsageSummaryQuery { TenantId = tenantId };
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return NotFound(result.ErrorMessage);

        return Ok(result.Value);
    }
}

public record AssignSubscriptionRequest(
    Guid PlanId,
    SubscriptionStatus Status,
    DateTime? TrialEndsAt,
    DateTime? CurrentPeriodEndsAt
);

public record ChangePlanRequest(
    Guid NewPlanId
);
