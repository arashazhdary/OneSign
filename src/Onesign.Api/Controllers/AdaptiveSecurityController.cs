using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.AdaptiveSecurity.Application.Commands;
using Onesign.Modules.AdaptiveSecurity.Application.DTOs;
using Onesign.Modules.AdaptiveSecurity.Application.Queries;
using Onesign.Modules.AdaptiveSecurity.Domain.Enums;

namespace Onesign.Api.Controllers;

[Route("api/tenants/{tenantId:guid}/adaptive-security")]
[Authorize]
public class AdaptiveSecurityController : TenantControllerBase
{
    private readonly IMediator _mediator;

    public AdaptiveSecurityController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("policies")]
    public async Task<IActionResult> GetPolicies(Guid tenantId, CancellationToken cancellationToken)
    {
        var query = new GetAdaptivePoliciesQuery { TenantId = tenantId };
        var result = await _mediator.Send(query, cancellationToken);

        if (result.IsFailure)
            return BadRequest(new { result.ErrorCode, result.ErrorMessage });

        return Ok(result.Value);
    }

    [HttpPost("policies")]
    public async Task<IActionResult> CreatePolicy(
        Guid tenantId,
        [FromBody] CreateAdaptivePolicyRequest request,
        CancellationToken cancellationToken)
    {
        var command = new CreateAdaptivePolicyCommand
        {
            TenantId = tenantId,
            Name = request.Name,
            Description = request.Description,
            Conditions = request.Conditions,
            Actions = request.Actions,
            RiskThreshold = request.RiskThreshold,
            IsEnabled = request.IsEnabled,
            Priority = request.Priority
        };

        var result = await _mediator.Send(command, cancellationToken);

        if (result.IsFailure)
            return BadRequest(new { result.ErrorCode, result.ErrorMessage });

        return CreatedAtAction(nameof(GetPolicies), new { tenantId }, result.Value);
    }

    [HttpPut("policies/{policyId:guid}")]
    public async Task<IActionResult> UpdatePolicy(
        Guid tenantId,
        Guid policyId,
        [FromBody] CreateAdaptivePolicyRequest request,
        CancellationToken cancellationToken)
    {
        var command = new UpdateAdaptivePolicyCommand
        {
            TenantId = tenantId,
            PolicyId = policyId,
            Name = request.Name,
            Description = request.Description,
            Conditions = request.Conditions,
            Actions = request.Actions,
            RiskThreshold = request.RiskThreshold,
            IsEnabled = request.IsEnabled,
            Priority = request.Priority
        };

        var result = await _mediator.Send(command, cancellationToken);

        if (result.IsFailure)
            return BadRequest(new { result.ErrorCode, result.ErrorMessage });

        return Ok(result.Value);
    }

    [HttpDelete("policies/{policyId:guid}")]
    public async Task<IActionResult> DeletePolicy(
        Guid tenantId,
        Guid policyId,
        CancellationToken cancellationToken)
    {
        var command = new DeleteAdaptivePolicyCommand
        {
            TenantId = tenantId,
            PolicyId = policyId
        };

        var result = await _mediator.Send(command, cancellationToken);

        if (result.IsFailure)
            return BadRequest(new { result.ErrorCode, result.ErrorMessage });

        return NoContent();
    }

    [HttpGet("signals")]
    public async Task<IActionResult> GetSecuritySignals(
        Guid tenantId,
        [FromQuery] string? type,
        [FromQuery] int limit = 100,
        CancellationToken cancellationToken = default)
    {
        var query = new GetSecuritySignalsQuery
        {
            TenantId = tenantId,
            SignalType = type,
            Limit = limit
        };

        var result = await _mediator.Send(query, cancellationToken);

        if (result.IsFailure)
            return BadRequest(new { result.ErrorCode, result.ErrorMessage });

        return Ok(result.Value);
    }

    [HttpPost("signals")]
    public async Task<IActionResult> ProcessSecuritySignal(
        Guid tenantId,
        [FromBody] ProcessSecuritySignalRequest request,
        CancellationToken cancellationToken)
    {
        var command = new ProcessSecuritySignalCommand
        {
            TenantId = tenantId,
            UserId = request.UserId,
            SessionId = request.SessionId,
            SignalType = request.SignalType,
            RiskScore = request.RiskScore,
            Details = request.Details
        };

        var result = await _mediator.Send(command, cancellationToken);

        if (result.IsFailure)
            return BadRequest(new { result.ErrorCode, result.ErrorMessage });

        return Ok(result.Value);
    }

    [HttpGet("users/{userId:guid}/context")]
    public async Task<IActionResult> GetUserSecurityContext(
        Guid tenantId,
        Guid userId,
        CancellationToken cancellationToken)
    {
        var query = new GetUserSecurityContextQuery
        {
            TenantId = tenantId,
            UserId = userId
        };

        var result = await _mediator.Send(query, cancellationToken);

        if (result.IsFailure)
            return BadRequest(new { result.ErrorCode, result.ErrorMessage });

        return Ok(result.Value);
    }

    [HttpPut("users/{userId:guid}/context")]
    public async Task<IActionResult> UpdateUserSecurityContext(
        Guid tenantId,
        Guid userId,
        [FromBody] UpdateUserSecurityContextRequest request,
        CancellationToken cancellationToken)
    {
        var command = new UpdateUserSecurityContextCommand
        {
            TenantId = tenantId,
            UserId = userId,
            TrustedDevices = request.TrustedDevices,
            TrustedLocations = request.TrustedLocations
        };

        var result = await _mediator.Send(command, cancellationToken);

        if (result.IsFailure)
            return BadRequest(new { result.ErrorCode, result.ErrorMessage });

        return Ok(result.Value);
    }
}
