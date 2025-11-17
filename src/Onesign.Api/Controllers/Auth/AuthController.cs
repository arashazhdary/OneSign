using MediatR;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;
using Onesign.Modules.Identity.Application.Commands;
using Onesign.Modules.Identity.Application.DTOs;
using Onesign.Modules.Identity.Domain.Repositories;
using Onesign.Shared.Email;
using Onesign.Shared.Localization;
using System.Text.Json;

namespace Onesign.Api.Controllers.Auth;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ITenantUserRepository _tenantUserRepository;
    private readonly IGlobalUserRepository _globalUserRepository;
    private readonly ILocalizationService _localizationService;
    private readonly IWebHostEnvironment _environment;
    private readonly Onesign.Shared.Email.IEmailService? _emailService;

    public AuthController(
        IMediator mediator,
        ITenantUserRepository tenantUserRepository,
        IGlobalUserRepository globalUserRepository,
        ILocalizationService localizationService,
        IWebHostEnvironment environment,
        Onesign.Shared.Email.IEmailService? emailService = null)
    {
        _mediator = mediator;
        _tenantUserRepository = tenantUserRepository;
        _globalUserRepository = globalUserRepository;
        _localizationService = localizationService;
        _environment = environment;
        _emailService = emailService;
    }

    private string GetCulture()
    {
        return HttpContext.Items["Culture"]?.ToString() ?? "en";
    }

    /// <summary>
    /// Authenticates a user with email and password
    /// </summary>
    /// <param name="request">Login credentials</param>
    /// <param name="tenantId">Tenant ID</param>
    /// <returns>Access token and ID token</returns>
    /// <response code="200">Login successful</response>
    /// <response code="401">Invalid credentials</response>
    /// <response code="429">Too many requests - rate limit exceeded</response>
    /// <remarks>
    /// Sample request:
    /// 
    ///     POST /api/auth/login?tenantId=12345678-1234-1234-1234-123456789012
    ///     {
    ///         "email": "user@example.com",
    ///         "password": "SecurePassword123!"
    ///     }
    /// </remarks>
    [HttpPost("login")]
    [ProducesResponseType(typeof(LoginResponse), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(429)]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request, [FromQuery] Guid tenantId)
    {
        var command = new PasswordLoginCommand
        {
            TenantId = tenantId,
            Email = request.Email,
            Password = request.Password
        };
        var result = await _mediator.Send(command);
        
        if (result.IsFailure)
        {
            var culture = GetCulture();
            var localizedMessage = _localizationService.GetString(result.ErrorCode ?? "UNKNOWN_ERROR", culture);
            return Unauthorized(new { errorCode = result.ErrorCode, errorMessage = localizedMessage });
        }

        // Extract tenant user ID from ID token and store in session
        try
        {
            if (result.Value != null && !string.IsNullOrEmpty(result.Value.IdToken))
            {
                var idTokenParts = result.Value.IdToken.Split('.');
                if (idTokenParts.Length == 3)
                {
                    var payload = idTokenParts[1];
                    var padding = payload.Length % 4;
                    if (padding != 0)
                    {
                        payload += new string('=', 4 - padding);
                    }
                    var payloadBytes = Convert.FromBase64String(payload);
                    var payloadJson = System.Text.Encoding.UTF8.GetString(payloadBytes);
                    var tokenData = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(payloadJson);
                    
                    if (tokenData != null && tokenData.ContainsKey("sub"))
                    {
                        var tenantUserId = tokenData["sub"].GetString();
                        if (!string.IsNullOrEmpty(tenantUserId))
                        {
                            HttpContext.Session.SetString("TenantUserId", tenantUserId);
                        }
                    }
                }
            }
        }
        catch
        {
            // If token decode fails, try to get from repository
            var globalUser = await _globalUserRepository.GetByEmailAsync(request.Email);
            if (globalUser != null)
            {
                var tenantUser = await _tenantUserRepository.GetByGlobalUserIdAndTenantIdAsync(globalUser.Id, tenantId);
                if (tenantUser != null)
                {
                    HttpContext.Session.SetString("TenantUserId", tenantUser.Id.ToString());
                }
            }
        }

        return Ok(result.Value);
    }

    [HttpPost("forgot-password")]
    public async Task<ActionResult> ForgotPassword([FromBody] ResetPasswordRequest request, [FromQuery] Guid tenantId)
    {
        var command = new RequestPasswordResetCommand
        {
            TenantId = tenantId,
            Email = request.Email
        };
        var result = await _mediator.Send(command);
        
        if (result.IsFailure)
        {
            var culture = GetCulture();
            var localizedMessage = _localizationService.GetString(result.ErrorCode ?? "UNKNOWN_ERROR", culture);
            return BadRequest(new { errorCode = result.ErrorCode, errorMessage = localizedMessage });
        }

        // Email service is integrated in RequestPasswordResetCommandHandler
        // If email service is configured, the token is sent via email
        // In production with email service, don't return token in response for security
        var response = new Dictionary<string, object>
        {
            { "message", "Password reset token has been generated. If email service is configured, check your email." }
        };

        // Only return token in development or if email service is not configured
        if (_environment.IsDevelopment() || _emailService == null)
        {
            response["token"] = result.Value ?? string.Empty;
        }

        return Ok(response);
    }

    [HttpPost("reset-password")]
    public async Task<ActionResult> ResetPassword([FromBody] ResetPasswordConfirmRequest request)
    {
        var command = new ConfirmPasswordResetCommand
        {
            Token = request.Token,
            NewPassword = request.NewPassword
        };
        var result = await _mediator.Send(command);
        
        if (result.IsFailure)
        {
            var culture = GetCulture();
            var localizedMessage = _localizationService.GetString(result.ErrorCode ?? "UNKNOWN_ERROR", culture);
            return BadRequest(new { errorCode = result.ErrorCode, errorMessage = localizedMessage });
        }

        return Ok(new { message = "Password has been reset successfully" });
    }

    [HttpPost("google-login")]
    public async Task<ActionResult<LoginResponse>> GoogleLogin([FromBody] GoogleLoginRequest request, [FromQuery] Guid tenantId)
    {
        var command = new GoogleLoginCommand
        {
            TenantId = tenantId,
            IdToken = request.IdToken,
            ClientId = request.ClientId
        };
        var result = await _mediator.Send(command);
        
        if (result.IsFailure)
        {
            var culture = GetCulture();
            var localizedMessage = _localizationService.GetString(result.ErrorCode ?? "UNKNOWN_ERROR", culture);
            return Unauthorized(new { errorCode = result.ErrorCode, errorMessage = localizedMessage });
        }

        // Extract tenant user ID from ID token and store in session
        try
        {
            if (result.Value != null && !string.IsNullOrEmpty(result.Value.IdToken))
            {
                var idTokenParts = result.Value.IdToken.Split('.');
                if (idTokenParts.Length == 3)
                {
                    var payload = idTokenParts[1];
                    var padding = payload.Length % 4;
                    if (padding != 0)
                    {
                        payload += new string('=', 4 - padding);
                    }
                    var payloadBytes = Convert.FromBase64String(payload);
                    var payloadJson = System.Text.Encoding.UTF8.GetString(payloadBytes);
                    var tokenData = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(payloadJson);
                    
                    if (tokenData != null && tokenData.ContainsKey("sub"))
                    {
                        var tenantUserId = tokenData["sub"].GetString();
                        if (!string.IsNullOrEmpty(tenantUserId))
                        {
                            HttpContext.Session.SetString("TenantUserId", tenantUserId);
                        }
                    }
                }
            }
        }
        catch
        {
            // Session storage failed, but login was successful
        }

        return Ok(result.Value);
    }

    [HttpPost("complete-first-login")]
    public async Task<ActionResult<TenantUserDto>> CompleteFirstLogin([FromBody] CompleteFirstLoginRequest request)
    {
        var command = new CompleteFirstLoginCommand
        {
            TenantUserId = request.TenantUserId,
            Password = request.Password
        };
        var result = await _mediator.Send(command);
        
        if (result.IsFailure)
        {
            var culture = GetCulture();
            var localizedMessage = _localizationService.GetString(result.ErrorCode ?? "UNKNOWN_ERROR", culture);
            return BadRequest(new { errorCode = result.ErrorCode, errorMessage = localizedMessage });
        }

        return Ok(result.Value);
    }
}

public class GoogleLoginRequest
{
    public string IdToken { get; set; } = string.Empty;
    public Guid? ClientId { get; set; }
}

public class CompleteFirstLoginRequest
{
    public Guid TenantUserId { get; set; }
    public string Password { get; set; } = string.Empty;
}

