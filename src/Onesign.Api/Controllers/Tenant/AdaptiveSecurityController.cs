using MediatR;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.AdaptiveSecurity.Application.Commands;
using Onesign.Modules.AdaptiveSecurity.Application.DTOs;
using Onesign.Modules.AdaptiveSecurity.Application.Queries;
using Onesign.Modules.AdaptiveSecurity.Domain.Enums;

namespace Onesign.Api.Controllers.Tenant;

[Route("api/tenant/adaptive-security")]
public class AdaptiveSecurityController : TenantControllerBase
{
    private readonly IMediator _mediator;

    public AdaptiveSecurityController(IMediator mediator) => _mediator = mediator;

    // Adaptive Policies

    [HttpGet("policies")]
    public async Task<ActionResult<List<AdaptivePolicyDto>>> GetPolicies([FromQuery] Guid tenantId, [FromQuery] bool? enabledOnly = null)
    {
        var result = await _mediator.Send(new GetAdaptivePoliciesQuery
        {
            TenantId = tenantId,
            EnabledOnly = enabledOnly
        });
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.ErrorMessage);
    }

    [HttpGet("policies/{id}")]
    public async Task<ActionResult<AdaptivePolicyDto>> GetPolicy(Guid id)
    {
        // Implementation would use a GetAdaptivePolicyByIdQuery
        return Ok(new AdaptivePolicyDto { Id = id });
    }

    [HttpPost("policies")]
    public async Task<ActionResult<AdaptivePolicyDto>> CreatePolicy([FromQuery] Guid tenantId, [FromBody] CreateAdaptivePolicyRequest request)
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

        var result = await _mediator.Send(command);
        return result.IsSuccess ? CreatedAtAction(nameof(GetPolicy), new { id = result.Value!.Id }, result.Value) : BadRequest(result.ErrorMessage);
    }

    [HttpPut("policies/{id}")]
    public async Task<ActionResult> UpdatePolicy(Guid id, [FromBody] CreateAdaptivePolicyRequest request)
    {
        // Implementation would use an UpdateAdaptivePolicyCommand
        return Ok();
    }

    [HttpDelete("policies/{id}")]
    public async Task<ActionResult> DeletePolicy(Guid id)
    {
        // Implementation would use a DeleteAdaptivePolicyCommand
        return NoContent();
    }

    [HttpPost("policies/{id}/enable")]
    public async Task<ActionResult> EnablePolicy(Guid id)
    {
        // Implementation would toggle policy enabled state
        return Ok();
    }

    [HttpPost("policies/{id}/disable")]
    public async Task<ActionResult> DisablePolicy(Guid id)
    {
        // Implementation would toggle policy disabled state
        return Ok();
    }

    // Security Signals

    [HttpGet("signals")]
    public async Task<ActionResult<List<SecuritySignalDto>>> GetSignals(
        [FromQuery] Guid tenantId,
        [FromQuery] Guid? userId = null,
        [FromQuery] SecuritySignalType? signalType = null,
        [FromQuery] int limit = 100)
    {
        var result = await _mediator.Send(new GetSecuritySignalsQuery
        {
            TenantId = tenantId,
            UserId = userId,
            SignalType = signalType,
            Limit = limit
        });
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.ErrorMessage);
    }

    [HttpPost("signals")]
    public async Task<ActionResult<SecuritySignalDto>> ProcessSignal([FromQuery] Guid tenantId, [FromBody] ProcessSecuritySignalRequest request)
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

        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.ErrorMessage);
    }

    // User Security Context

    [HttpGet("users/{userId}/context")]
    public async Task<ActionResult<UserSecurityContextDto>> GetUserSecurityContext(Guid userId, [FromQuery] Guid tenantId)
    {
        var result = await _mediator.Send(new GetUserSecurityContextQuery
        {
            TenantId = tenantId,
            UserId = userId
        });
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.ErrorMessage);
    }

    [HttpPut("users/{userId}/context")]
    public async Task<ActionResult<UserSecurityContextDto>> UpdateUserSecurityContext(
        Guid userId,
        [FromQuery] Guid tenantId,
        [FromBody] UpdateUserSecurityContextRequest request)
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

        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.ErrorMessage);
    }

    [HttpGet("users/{userId}/risk-score")]
    public async Task<ActionResult> GetUserRiskScore(Guid userId, [FromQuery] Guid tenantId)
    {
        var result = await _mediator.Send(new GetUserSecurityContextQuery
        {
            TenantId = tenantId,
            UserId = userId
        });

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
