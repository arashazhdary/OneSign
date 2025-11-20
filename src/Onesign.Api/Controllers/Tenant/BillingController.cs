using MediatR;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.Billing.Application.DTOs;
using Onesign.Modules.Billing.Application.Queries;

namespace Onesign.Api.Controllers.Tenant;

[Route("api/tenant/billing")]
public class BillingController : TenantControllerBase
{
    private readonly IMediator _mediator;

    public BillingController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("summary")]
    public async Task<ActionResult<TenantUsageSummaryDto>> GetBillingSummary([FromQuery] Guid tenantId)
    {
        var query = new GetTenantUsageSummaryQuery { TenantId = tenantId };
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);

        return Ok(result.Value);
    }

    [HttpGet("quota-status")]
    public async Task<ActionResult<TenantQuotaStatusDto>> GetQuotaStatus([FromQuery] Guid tenantId)
    {
        var query = new GetTenantQuotaStatusQuery { TenantId = tenantId };
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);

        return Ok(result.Value);
    }

    [HttpGet("subscription")]
    public async Task<ActionResult<TenantSubscriptionDto>> GetSubscription([FromQuery] Guid tenantId)
    {
        var query = new GetTenantSubscriptionQuery { TenantId = tenantId };
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return NotFound(result.ErrorMessage);

        return Ok(result.Value);
    }

    [HttpPost("upgrade-requests")]
    public async Task<ActionResult> RequestUpgrade([FromQuery] Guid tenantId, [FromBody] UpgradeRequest request)
    {
        // For Phase 5, this is a simple placeholder that would log the request
        // In a future phase, this would integrate with a ticketing system or send notifications

        // TODO: Store upgrade request in database
        // TODO: Send notification to SaaS admins
        // TODO: Create audit log entry

        return Ok(new { message = "Upgrade request submitted successfully" });
    }
}

public record UpgradeRequest(
    Guid TargetPlanId,
    string? Comments
);
