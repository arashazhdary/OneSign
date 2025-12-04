using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.Identity.Application.Commands;
using Onesign.Modules.Identity.Application.DTOs;

namespace Onesign.Api.Controllers.Auth;

/// <summary>
/// Controller for WebAuthn/Passkeys authentication
/// </summary>
[ApiController]
[Route("api/auth/passkeys")]
public class PasskeysController : ControllerBase
{
    private readonly IMediator _mediator;

    public PasskeysController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get registration options for creating a new passkey
    /// </summary>
    /// <param name="request">Registration options request</param>
    /// <param name="tenantId">The tenant ID</param>
    /// <returns>WebAuthn credential creation options</returns>
    [HttpPost("register/options")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<object>> GetRegisterOptions(
        [FromBody] RegisterPasskeyOptionsRequest request,
        [FromQuery] Guid tenantId)
    {
        var command = new RegisterPasskeyOptionsCommand
        {
            TenantId = tenantId,
            Email = request.Email
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            return BadRequest(new { errorCode = result.ErrorCode, errorMessage = result.ErrorMessage });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Verify and complete passkey registration
    /// </summary>
    /// <param name="request">Registration verification request</param>
    /// <param name="tenantId">The tenant ID</param>
    /// <returns>Success response</returns>
    [HttpPost("register/verify")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> VerifyRegistration(
        [FromBody] RegisterPasskeyVerifyRequest request,
        [FromQuery] Guid tenantId)
    {
        var command = new RegisterPasskeyVerifyCommand
        {
            TenantId = tenantId,
            Email = request.Email,
            DeviceName = request.DeviceName,
            AttestationResponse = request.AttestationResponse
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            return BadRequest(new { errorCode = result.ErrorCode, errorMessage = result.ErrorMessage });
        }

        return Ok(new { message = "Passkey registered successfully" });
    }

    /// <summary>
    /// Get authentication options for passkey login
    /// </summary>
    /// <param name="request">Authentication options request</param>
    /// <param name="tenantId">The tenant ID</param>
    /// <returns>WebAuthn assertion options</returns>
    [HttpPost("authenticate/options")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<object>> GetAuthenticateOptions(
        [FromBody] AuthenticatePasskeyOptionsRequest request,
        [FromQuery] Guid tenantId)
    {
        var command = new AuthenticatePasskeyOptionsCommand
        {
            TenantId = tenantId,
            Email = request.Email
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            return BadRequest(new { errorCode = result.ErrorCode, errorMessage = result.ErrorMessage });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Verify passkey authentication and issue tokens
    /// </summary>
    /// <param name="request">Authentication verification request</param>
    /// <param name="tenantId">The tenant ID</param>
    /// <returns>Login response with tokens</returns>
    [HttpPost("authenticate/verify")]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<LoginResponse>> VerifyAuthentication(
        [FromBody] AuthenticatePasskeyVerifyRequest request,
        [FromQuery] Guid tenantId)
    {
        var command = new AuthenticatePasskeyVerifyCommand
        {
            TenantId = tenantId,
            ClientId = request.ClientId,
            AssertionResponse = request.AssertionResponse
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            return BadRequest(new { errorCode = result.ErrorCode, errorMessage = result.ErrorMessage });
        }

        return Ok(result.Value);
    }
}

/// <summary>
/// Request for getting passkey registration options
/// </summary>
public class RegisterPasskeyOptionsRequest
{
    public string Email { get; set; } = string.Empty;
}

/// <summary>
/// Request for verifying passkey registration
/// </summary>
public class RegisterPasskeyVerifyRequest
{
    public string Email { get; set; } = string.Empty;
    public string? DeviceName { get; set; }
    public object AttestationResponse { get; set; } = null!;
}

/// <summary>
/// Request for getting passkey authentication options
/// </summary>
public class AuthenticatePasskeyOptionsRequest
{
    public string? Email { get; set; }
}

/// <summary>
/// Request for verifying passkey authentication
/// </summary>
public class AuthenticatePasskeyVerifyRequest
{
    public string? ClientId { get; set; }
    public object AssertionResponse { get; set; } = null!;
}
