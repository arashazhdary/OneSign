using MediatR;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.Identity.Application.Commands;
using Onesign.Modules.Identity.Application.DTOs;
using Onesign.Modules.Identity.Application.Queries;
using Onesign.Modules.Organization.Application.Commands;
using Onesign.Modules.Organization.Application.DTOs;
using Onesign.Modules.Organization.Application.Queries;
using Onesign.Shared.Localization;
using Onesign.Shared.Pagination;
using Onesign.Shared.Result;

namespace Onesign.Api.Controllers.Tenant;

[Route("api/tenant/users")]
public class UsersController : Onesign.Api.Controllers.TenantControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILocalizationService _localizationService;

    public UsersController(IMediator mediator, ILocalizationService localizationService)
    {
        _mediator = mediator;
        _localizationService = localizationService;
    }

    private string GetCultureString()
    {
        return HttpContext.Items["Culture"]?.ToString() ?? "en";
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<TenantUserDto>>> GetUsers(
        [FromQuery] Guid tenantId,
        [FromQuery] Guid? orgUnitId,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var query = new GetTenantUsersQuery
        {
            TenantId = tenantId,
            OrgUnitId = orgUnitId,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPost("invite")]
    public async Task<ActionResult<TenantUserDto>> InviteUser([FromBody] InviteUserRequest request, [FromQuery] Guid tenantId)
    {
        var command = new InviteUserToTenantCommand
        {
            TenantId = tenantId,
            Email = request.Email,
            IsAdmin = request.IsAdmin
        };
        var result = await _mediator.Send(command);
        
        if (result.IsFailure)
        {
            var culture = GetCultureString();
            var localizedMessage = _localizationService.GetString(result.ErrorCode ?? "UNKNOWN_ERROR", culture);
            return BadRequest(new { errorCode = result.ErrorCode, errorMessage = localizedMessage });
        }

        return CreatedAtAction(nameof(GetUsers), new { tenantId }, result.Value);
    }

    [HttpGet("{tenantUserId}")]
    public async Task<ActionResult<TenantUserDto>> GetUserDetails(Guid tenantUserId)
    {
        var query = new GetUserDetailsQuery
        {
            TenantUserId = tenantUserId
        };
        var result = await _mediator.Send(query);
        
        if (result == null)
        {
            return NotFound();
        }

        return Ok(result);
    }

    [HttpPatch("{tenantUserId}/status")]
    public async Task<ActionResult<TenantUserDto>> DisableUser(
        Guid tenantUserId,
        [FromQuery] Guid tenantId)
    {
        var command = new DisableTenantUserCommand
        {
            TenantUserId = tenantUserId,
            TenantId = tenantId
        };
        var result = await _mediator.Send(command);
        
        if (result.IsFailure)
        {
            var culture = GetCultureString();
            var localizedMessage = _localizationService.GetString(result.ErrorCode ?? "UNKNOWN_ERROR", culture);
            return BadRequest(new { errorCode = result.ErrorCode, errorMessage = localizedMessage });
        }

        return Ok(result.Value);
    }

    [HttpGet("{tenantUserId}/org-units")]
    public async Task<ActionResult<AssignUserOrgUnitsRequest>> GetUserOrgUnits(Guid tenantUserId, [FromQuery] Guid tenantId)
    {
        var query = new GetUserOrgUnitsQuery { TenantUserId = tenantUserId, TenantId = tenantId };
        var result = await _mediator.Send(query);

        if (result.IsFailure)
        {
            var culture = GetCultureString();
            var localizedMessage = _localizationService.GetString(result.ErrorCode ?? "UNKNOWN_ERROR", culture);
            return BadRequest(new { errorCode = result.ErrorCode, errorMessage = localizedMessage });
        }

        return Ok(result.Value);
    }

    [HttpPut("{tenantUserId}/org-units")]
    public async Task<ActionResult> AssignUserOrgUnits(Guid tenantUserId, [FromBody] AssignUserOrgUnitsRequest request, [FromQuery] Guid tenantId)
    {
        var command = new AssignUserOrgUnitsCommand
        {
            TenantUserId = tenantUserId,
            TenantId = tenantId,
            PrimaryOrgUnitId = request.PrimaryOrgUnitId,
            SecondaryOrgUnitIds = request.SecondaryOrgUnitIds,
            ActorId = GetCurrentUserId()
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            var culture = GetCultureString();
            var localizedMessage = _localizationService.GetString(result.ErrorCode ?? "UNKNOWN_ERROR", culture);
            return BadRequest(new { errorCode = result.ErrorCode, errorMessage = localizedMessage });
        }

        return NoContent();
    }

    [HttpGet("current/scope")]
    public async Task<ActionResult<CurrentUserScopeDto>> GetCurrentUserScope()
    {
        var currentUserId = GetCurrentUserId();

        if (currentUserId == Guid.Empty)
        {
            return Unauthorized(new { errorCode = "UNAUTHORIZED", errorMessage = "User not authenticated" });
        }

        var query = new GetCurrentUserScopeQuery { TenantUserId = currentUserId };
        var result = await _mediator.Send(query);

        if (result.IsFailure)
        {
            var culture = GetCultureString();
            var localizedMessage = _localizationService.GetString(result.ErrorCode ?? "UNKNOWN_ERROR", culture);
            return BadRequest(new { errorCode = result.ErrorCode, errorMessage = localizedMessage });
        }

        return Ok(result.Value);
    }
}

