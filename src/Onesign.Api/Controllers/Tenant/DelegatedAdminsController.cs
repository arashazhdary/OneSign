using MediatR;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.Organization.Application.Commands;
using Onesign.Modules.Organization.Application.DTOs;
using Onesign.Modules.Organization.Application.Queries;
using Onesign.Shared.Localization;
using Onesign.Shared.Result;

namespace Onesign.Api.Controllers.Tenant;

[Route("api/tenant/delegated-admins")]
[Route("api/tenant/delegatedadmins")]
public class DelegatedAdminsController : Onesign.Api.Controllers.TenantControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILocalizationService _localizationService;

    public DelegatedAdminsController(IMediator mediator, ILocalizationService localizationService)
    {
        _mediator = mediator;
        _localizationService = localizationService;
    }

    [HttpGet]
    public async Task<ActionResult<List<DelegatedAdminDto>>> GetAll([FromQuery] Guid tenantId)
    {
        var query = new GetDelegatedAdminsQuery { TenantId = tenantId };
        var result = await _mediator.Send(query);

        if (result.IsFailure)
        {
            var culture = GetCulture();
            var localizedMessage = _localizationService.GetString(result.ErrorCode ?? "UNKNOWN_ERROR", culture);
            return BadRequest(new { errorCode = result.ErrorCode, errorMessage = localizedMessage });
        }

        return Ok(result.Value);
    }

    [HttpPost]
    public async Task<ActionResult<DelegatedAdminDto>> Create([FromBody] CreateDelegatedAdminRequest request, [FromQuery] Guid tenantId)
    {
        var command = new CreateDelegatedAdminCommand
        {
            TenantUserId = request.TenantUserId,
            TenantId = tenantId,
            OrgUnitId = request.OrgUnitId,
            ScopeType = request.ScopeType,
            ActorId = GetCurrentUserId()
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

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id, [FromQuery] Guid tenantId)
    {
        var command = new RemoveDelegatedAdminCommand
        {
            DelegatedAdminId = id,
            TenantId = tenantId,
            ActorId = GetCurrentUserId()
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            var culture = GetCulture();
            var localizedMessage = _localizationService.GetString(result.ErrorCode ?? "UNKNOWN_ERROR", culture);
            return BadRequest(new { errorCode = result.ErrorCode, errorMessage = localizedMessage });
        }

        return NoContent();
    }
}

