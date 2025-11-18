using MediatR;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.Security.Application.Commands;
using Onesign.Modules.Security.Application.DTOs;
using Onesign.Modules.Security.Application.Queries;
using Onesign.Shared.Localization;

namespace Onesign.Api.Controllers.Tenant;

[Route("api/tenant/mfa")]
public class MfaController : Onesign.Api.Controllers.TenantControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILocalizationService _localizationService;

    public MfaController(IMediator mediator, ILocalizationService localizationService)
    {
        _mediator = mediator;
        _localizationService = localizationService;
    }

    private new string GetCulture()
    {
        return HttpContext.Items["Culture"]?.ToString() ?? "en";
    }

    [HttpGet("methods")]
    public async Task<ActionResult<List<UserMfaMethodDto>>> GetMethods([FromQuery] Guid userId)
    {
        var query = new GetUserMfaMethodsQuery { UserId = userId };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPost("totp/begin")]
    public async Task<ActionResult<BeginTotpEnrollmentResponse>> BeginTotpEnrollment(
        [FromQuery] Guid userId,
        [FromQuery] string userEmail)
    {
        var command = new BeginTotpEnrollmentCommand
        {
            UserId = userId,
            UserEmail = userEmail
        };

        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpPost("totp/confirm")]
    public async Task<ActionResult<UserMfaMethodDto>> ConfirmTotpEnrollment(
        [FromQuery] Guid userId,
        [FromQuery] Guid tenantId,
        [FromBody] ConfirmTotpEnrollmentRequest request)
    {
        var command = new ConfirmTotpEnrollmentCommand
        {
            UserId = userId,
            TenantId = tenantId,
            Secret = request.Secret,
            Code = request.Code
        };

        try
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { errorMessage = ex.Message });
        }
    }

    [HttpDelete("methods/{methodId}")]
    public async Task<IActionResult> DisableMethod(Guid methodId, [FromQuery] Guid userId)
    {
        var command = new DisableMfaMethodCommand
        {
            UserId = userId,
            MethodId = methodId
        };

        try
        {
            await _mediator.Send(command);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { errorMessage = ex.Message });
        }
    }

    [HttpPost("challenge")]
    public async Task<ActionResult<MfaChallengeResponse>> CreateChallenge(
        [FromQuery] Guid userId,
        [FromQuery] Guid tenantId,
        [FromQuery] string userEmail,
        [FromBody] MfaChallengeRequest request)
    {
        var command = new CreateMfaChallengeCommand
        {
            UserId = userId,
            TenantId = tenantId,
            PreferredMethodType = request.PreferredMethodType,
            UserEmail = userEmail
        };

        try
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { errorMessage = ex.Message });
        }
    }

    [HttpPost("verify")]
    public async Task<ActionResult<bool>> VerifyChallenge([FromBody] VerifyMfaRequest request)
    {
        var command = new VerifyMfaChallengeCommand
        {
            ChallengeId = request.ChallengeId,
            Code = request.Code,
            RememberDevice = request.RememberDevice,
            DeviceFingerprint = request.DeviceFingerprint
        };

        var result = await _mediator.Send(command);
        return Ok(new { success = result });
    }

    [HttpGet("check-requirement")]
    public async Task<ActionResult<bool>> CheckMfaRequirement(
        [FromQuery] Guid tenantId,
        [FromQuery] Guid userId,
        [FromQuery] Guid? orgUnitId,
        [FromQuery] bool isAdmin)
    {
        var query = new CheckMfaRequirementQuery
        {
            TenantId = tenantId,
            UserId = userId,
            OrgUnitId = orgUnitId,
            IsAdmin = isAdmin
        };

        var result = await _mediator.Send(query);
        return Ok(new { required = result });
    }
}
