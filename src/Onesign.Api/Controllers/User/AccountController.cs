using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.AccountCenter.Application.Commands;
using Onesign.Modules.AccountCenter.Application.DTOs;
using Onesign.Modules.AccountCenter.Application.Queries;
using Onesign.Modules.Identity.Application.Commands;
using Onesign.Modules.Identity.Application.DTOs;
using Onesign.Modules.Identity.Application.Queries;

namespace Onesign.Api.Controllers.User;

[Route("api/user/account")]
[Authorize]
public class AccountController : TenantControllerBase
{
    private readonly IMediator _mediator;

    public AccountController(IMediator mediator) => _mediator = mediator;

    [HttpGet("profile")]
    public async Task<ActionResult<UserProfileDto>> GetProfile()
    {
        var userId = GetCurrentUserId();
        var query = new GetUserProfileQuery { UserId = userId };
        var result = await _mediator.Send(query);
        return result.IsSuccess ? Ok(result.Value) : NotFound(result.ErrorMessage);
    }

    [HttpPut("profile")]
    public async Task<ActionResult<UserProfileDto>> UpdateProfile([FromBody] UpdateUserProfileCommand command)
    {
        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.ErrorMessage);
    }

    [HttpGet("activities")]
    public async Task<ActionResult<List<UserActivityDto>>> GetActivities(
        [FromQuery] Guid userId, [FromQuery] DateTime from, [FromQuery] DateTime to)
    {
        var query = new GetUserActivitiesQuery { UserId = userId, From = from, To = to };
        var result = await _mediator.Send(query);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.ErrorMessage);
    }

    /// <summary>
    /// Get all active sessions for the current user
    /// </summary>
    [HttpGet("sessions")]
    public async Task<ActionResult<List<UserSessionDto>>> GetSessions()
    {
        var userId = GetCurrentUserId();
        var currentToken = GetCurrentSessionToken();

        var query = new GetUserSessionsQuery
        {
            TenantUserId = userId,
            CurrentSessionToken = currentToken
        };

        var sessions = await _mediator.Send(query);
        return Ok(sessions);
    }

    /// <summary>
    /// Revoke a specific session
    /// </summary>
    [HttpDelete("sessions/{sessionId}")]
    public async Task<IActionResult> RevokeSession(Guid sessionId)
    {
        var userId = GetCurrentUserId();

        var command = new RevokeSessionCommand
        {
            SessionId = sessionId,
            TenantUserId = userId
        };

        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok() : BadRequest(new { message = result.ErrorMessage });
    }

    /// <summary>
    /// Revoke all sessions except the current one
    /// </summary>
    [HttpPost("sessions/revoke-all-others")]
    public async Task<IActionResult> RevokeAllOtherSessions()
    {
        var userId = GetCurrentUserId();
        var currentToken = GetCurrentSessionToken();

        var command = new RevokeAllOtherSessionsCommand
        {
            TenantUserId = userId,
            CurrentSessionToken = currentToken
        };

        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok() : BadRequest(new { message = result.ErrorMessage });
    }

    private string GetCurrentSessionToken()
    {
        // Try to get from Authorization header
        var authHeader = Request.Headers["Authorization"].FirstOrDefault();
        if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer "))
        {
            return authHeader.Substring("Bearer ".Length).Trim();
        }

        // Try to get from cookie
        var token = Request.Cookies["access_token"];
        return token ?? string.Empty;
    }
}
