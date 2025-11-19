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
            DetailsJson = request.DetailsJson
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
