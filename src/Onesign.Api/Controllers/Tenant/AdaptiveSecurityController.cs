using MediatR;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.AdaptiveSecurity.Application.Commands;
using Onesign.Modules.AdaptiveSecurity.Application.DTOs;
using Onesign.Modules.AdaptiveSecurity.Application.Queries;
using Onesign.Modules.AdaptiveSecurity.Domain.Enums;

namespace Onesign.Api.Controllers.Tenant;

[Route("api/tenant/adaptive-security")]
[Route("api/tenant/adaptivesecurity")]
public class AdaptiveSecurityController : TenantControllerBase
{
    private readonly IMediator _mediator;

    public AdaptiveSecurityController(IMediator mediator) => _mediator = mediator;

    // Adaptive Policies

    [HttpGet("policies")]
    public async Task<IActionResult> GetPolicies(
        [FromQuery] Guid tenantId, 
        [FromQuery] bool? enabledOnly = null,
        CancellationToken cancellationToken = default)
    {
        var query = new GetAdaptivePoliciesQuery 
        { 
            TenantId = tenantId,
            EnabledOnly = enabledOnly
        };
        var result = await _mediator.Send(query, cancellationToken);

        if (result.IsFailure)
            return BadRequest(new { result.ErrorCode, result.ErrorMessage });

        return Ok(result.Value);
    }

    [HttpGet("policies/{policyId:guid}")]
    public async Task<ActionResult<AdaptivePolicyDto>> GetPolicy(Guid policyId)
    {
        // Implementation would use a GetAdaptivePolicyByIdQuery
        return Ok(new AdaptivePolicyDto { Id = policyId });
    }

    [HttpPost("policies")]
    public async Task<IActionResult> CreatePolicy(
        [FromQuery] Guid tenantId,
        [FromBody] CreateAdaptivePolicyRequest request,
        CancellationToken cancellationToken = default)
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

        return CreatedAtAction(nameof(GetPolicy), new { policyId = result.Value!.Id }, result.Value);
    }

    [HttpPut("policies/{policyId:guid}")]
    public async Task<IActionResult> UpdatePolicy(
        [FromQuery] Guid tenantId,
        Guid policyId,
        [FromBody] CreateAdaptivePolicyRequest request,
        CancellationToken cancellationToken = default)
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
        [FromQuery] Guid tenantId,
        Guid policyId,
        CancellationToken cancellationToken = default)
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

    [HttpPost("policies/{policyId:guid}/enable")]
    public async Task<ActionResult> EnablePolicy(Guid policyId)
    {
        // Implementation would toggle policy enabled state
        return Ok();
    }

    [HttpPost("policies/{policyId:guid}/disable")]
    public async Task<ActionResult> DisablePolicy(Guid policyId)
    {
        // Implementation would toggle policy disabled state
        return Ok();
    }

    // Security Signals

    [HttpGet("signals")]
    public async Task<IActionResult> GetSecuritySignals(
        [FromQuery] Guid tenantId,
        [FromQuery] Guid? userId = null,
        [FromQuery] string? type = null,
        [FromQuery] int limit = 100,
        CancellationToken cancellationToken = default)
    {
        SecuritySignalType? signalType = null;
        if (!string.IsNullOrEmpty(type) && Enum.TryParse<SecuritySignalType>(type, true, out var parsedType))
        {
            signalType = parsedType;
        }

        var query = new GetSecuritySignalsQuery
        {
            TenantId = tenantId,
            UserId = userId,
            SignalType = signalType,
            Limit = limit
        };

        var result = await _mediator.Send(query, cancellationToken);

        if (result.IsFailure)
            return BadRequest(new { result.ErrorCode, result.ErrorMessage });

        return Ok(result.Value);
    }

    [HttpPost("signals")]
    public async Task<IActionResult> ProcessSecuritySignal(
        [FromQuery] Guid tenantId, 
        [FromBody] ProcessSecuritySignalRequest request,
        CancellationToken cancellationToken = default)
    {
        var command = new ProcessSecuritySignalCommand
        {
            TenantId = tenantId,
            UserId = request.UserId,
            SessionId = request.SessionId,
            SignalType = request.SignalType,
            RiskScore = request.RiskScore,
            DetailsJson = request.DetailsJson
        };

        var result = await _mediator.Send(command, cancellationToken);

        if (result.IsFailure)
            return BadRequest(new { result.ErrorCode, result.ErrorMessage });

        return Ok(result.Value);
    }

    // User Security Context

    [HttpGet("users/{userId:guid}/context")]
    public async Task<IActionResult> GetUserSecurityContext(
        Guid userId, 
        [FromQuery] Guid tenantId,
        CancellationToken cancellationToken = default)
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
        Guid userId,
        [FromQuery] Guid tenantId,
        [FromBody] UpdateUserSecurityContextRequest request,
        CancellationToken cancellationToken = default)
    {
        var command = new UpdateUserSecurityContextCommand
        {
            TenantId = tenantId,
            UserId = userId,
            LastLoginLocation = request.LastLoginLocation,
            LastLoginDevice = request.LastLoginDevice,
            TrustedDevices = request.TrustedDevices,
            TrustedLocations = request.TrustedLocations
        };

        var result = await _mediator.Send(command, cancellationToken);

        if (result.IsFailure)
            return BadRequest(new { result.ErrorCode, result.ErrorMessage });

        return Ok(result.Value);
    }

    [HttpGet("users/{userId:guid}/risk-score")]
    public async Task<ActionResult> GetUserRiskScore(
        Guid userId, 
        [FromQuery] Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(new GetUserSecurityContextQuery
        {
            TenantId = tenantId,
            UserId = userId
        }, cancellationToken);

        if (result.IsSuccess)
        {
            return Ok(new { UserId = userId, RiskScore = result.Value!.CurrentRiskScore });
        }

        return BadRequest(result.ErrorMessage);
    }

    [HttpGet("high-risk-users")]
    public async Task<ActionResult> GetHighRiskUsers([FromQuery] Guid tenantId, [FromQuery] int minRiskScore = 70)
    {
        // Implementation would query high-risk users
        return Ok(new List<object>());
    }

    // Evaluation

    [HttpPost("evaluate")]
    public async Task<ActionResult> EvaluateUser([FromQuery] Guid tenantId, [FromQuery] Guid userId)
    {
        // Implementation would use the IAdaptivePolicyEngine to evaluate user risk
        return Ok(new
        {
            IsAllowed = true,
            RiskLevel = RiskLevel.Low,
            RiskScore = 25,
            RequiredActions = new List<AdaptiveActionType>()
        });
    }

    // Dashboard

    [HttpGet("dashboard")]
    public async Task<ActionResult> GetDashboard([FromQuery] Guid tenantId)
    {
        return Ok(new
        {
            TotalPolicies = 0,
            EnabledPolicies = 0,
            TotalSignals = 0,
            UnprocessedSignals = 0,
            HighRiskUsersCount = 0,
            AverageRiskScore = 0
        });
    }
}
