using System.Text.Json;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.Billing.Application.DTOs;
using Onesign.Modules.Billing.Application.Queries;
using Onesign.Modules.Billing.Domain.Enums;
using Onesign.Modules.Billing.Domain.Repositories;
using Onesign.Modules.Observability.Domain.Enums;
using Onesign.Modules.Observability.Domain.Services;
using BillingUpgradeRequest = Onesign.Modules.Billing.Domain.Entities.UpgradeRequest;

namespace Onesign.Api.Controllers.Tenant;

[Route("api/tenant/billing")]
public class BillingController : TenantControllerBase
{
    private readonly IMediator _mediator;
    private readonly IUpgradeRequestRepository _upgradeRequestRepository;
    private readonly IAuditWriter _auditWriter;

    public BillingController(
        IMediator mediator,
        IUpgradeRequestRepository upgradeRequestRepository,
        IAuditWriter auditWriter)
    {
        _mediator = mediator;
        _upgradeRequestRepository = upgradeRequestRepository;
        _auditWriter = auditWriter;
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
        var currentTenantId = GetCurrentTenantId();
        if (currentTenantId == Guid.Empty)
        {
            currentTenantId = tenantId;
        }

        var userId = GetCurrentUserId();
        var userDisplayName = User.Identity?.Name ?? "Unknown User";

        // Store upgrade request in database
        var upgradeRequest = new BillingUpgradeRequest
        {
            Id = Guid.NewGuid(),
            TenantId = currentTenantId,
            TargetPlanId = request.TargetPlanId,
            Comments = request.Comments,
            Status = UpgradeRequestStatus.Pending,
            RequestedBy = userId.ToString(),
            RequestedAt = DateTime.UtcNow
        };

        await _upgradeRequestRepository.AddAsync(upgradeRequest);

        // Create audit log entry
        var auditData = JsonSerializer.Serialize(new
        {
            UpgradeRequestId = upgradeRequest.Id,
            TargetPlanId = request.TargetPlanId,
            Comments = request.Comments
        });

        await _auditWriter.WriteAsync(
            tenantId: currentTenantId,
            category: AuditCategory.Billing,
            severity: AuditSeverity.Info,
            action: "UpgradeRequested",
            actorId: userId.ToString(),
            actorDisplayName: userDisplayName,
            actorType: "User",
            targetType: "UpgradeRequest",
            targetId: upgradeRequest.Id.ToString(),
            ipAddress: HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            userAgent: Request.Headers.UserAgent.ToString(),
            dataJson: auditData);

        // Note: SaaS admin notification is handled by the NotificationDeliveryWorker
        // which monitors for new upgrade requests and sends notifications accordingly

        return Ok(new
        {
            message = "Upgrade request submitted successfully",
            requestId = upgradeRequest.Id,
            status = upgradeRequest.Status.ToString()
        });
    }
}

public record UpgradeRequest(
    Guid TargetPlanId,
    string? Comments
);
