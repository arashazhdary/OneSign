using MediatR;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.Privacy.Application.Commands;
using Onesign.Modules.Privacy.Application.Queries;
using Onesign.Modules.Privacy.Domain.Enums;

namespace Onesign.Api.Controllers.Tenant;

/// <summary>
/// Privacy & Data Protection Center (Phase 23)
/// </summary>
[Route("api/tenant/privacy")]
[ApiController]
public class PrivacyController : ControllerBase
{
    private readonly IMediator _mediator;

    public PrivacyController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get retention policies for tenant
    /// </summary>
    [HttpGet("retention-policies")]
    public async Task<ActionResult> GetRetentionPolicies()
    {
        // TODO: Get TenantId from context
        var tenantId = Guid.Empty;

        var query = new GetRetentionPoliciesQuery { TenantId = tenantId };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Update retention policy for a data category
    /// </summary>
    [HttpPut("retention-policies/{category}")]
    public async Task<ActionResult> UpdateRetentionPolicy(
        DataCategory category,
        [FromBody] UpdateRetentionPolicyRequest request)
    {
        // TODO: Get TenantId from context
        var tenantId = Guid.Empty;

        var command = new UpdateRetentionPolicyCommand
        {
            TenantId = tenantId,
            Category = category,
            RetentionPeriodDays = request.RetentionPeriodDays,
            HardDeleteAfter = request.HardDeleteAfter,
            Enabled = request.Enabled
        };

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok();
    }

    /// <summary>
    /// Get data subject requests
    /// </summary>
    [HttpGet("data-requests")]
    public async Task<ActionResult> GetDataRequests(
        [FromQuery] DataSubjectRequestStatus? status = null)
    {
        // TODO: Get TenantId from context
        var tenantId = Guid.Empty;

        var query = new GetDataSubjectRequestsQuery
        {
            TenantId = tenantId,
            Status = status
        };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Create a data subject request for a user
    /// </summary>
    [HttpPost("data-requests")]
    public async Task<ActionResult> CreateDataRequest([FromBody] CreateDataRequestRequest request)
    {
        // TODO: Get TenantId and RequesterId from context
        var tenantId = Guid.Empty;
        var requesterId = Guid.Empty;

        var command = new CreateDataSubjectRequestCommand
        {
            TenantId = tenantId,
            SubjectId = request.SubjectId,
            Type = request.Type,
            RequestedBy = requesterId,
            Reason = request.Reason
        };

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result.Value);
    }

    /// <summary>
    /// Execute a data subject request
    /// </summary>
    [HttpPost("data-requests/{id:guid}/execute")]
    public async Task<ActionResult> ExecuteDataRequest(Guid id)
    {
        var command = new ExecuteDataSubjectRequestCommand { RequestId = id };
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result.Value);
    }
}

public class UpdateRetentionPolicyRequest
{
    public int RetentionPeriodDays { get; set; }
    public bool HardDeleteAfter { get; set; }
    public bool Enabled { get; set; }
}

public class CreateDataRequestRequest
{
    public Guid SubjectId { get; set; }
    public DataSubjectRequestType Type { get; set; }
    public string? Reason { get; set; }
}
