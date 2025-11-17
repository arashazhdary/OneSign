using MediatR;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.Identity.Application.Commands;
using Onesign.Modules.Identity.Application.DTOs;
using Onesign.Modules.Identity.Application.Queries;
using Onesign.Shared.Localization;
using Onesign.Shared.Pagination;

namespace Onesign.Api.Controllers.Tenant;

[ApiController]
[Route("api/tenant/users")]
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILocalizationService _localizationService;

    public UsersController(IMediator mediator, ILocalizationService localizationService)
    {
        _mediator = mediator;
        _localizationService = localizationService;
    }

    private string GetCulture()
    {
        return HttpContext.Items["Culture"]?.ToString() ?? "en";
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<TenantUserDto>>> GetUsers(
        [FromQuery] Guid tenantId,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var query = new GetTenantUsersQuery
        {
            TenantId = tenantId,
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
            var culture = GetCulture();
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
            var culture = GetCulture();
            var localizedMessage = _localizationService.GetString(result.ErrorCode ?? "UNKNOWN_ERROR", culture);
            return BadRequest(new { errorCode = result.ErrorCode, errorMessage = localizedMessage });
        }

        return Ok(result.Value);
    }
}

