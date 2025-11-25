using MediatR;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.Organization.Application.Commands;
using Onesign.Modules.Organization.Application.DTOs;
using Onesign.Modules.Organization.Application.Queries;
using Onesign.Shared.Localization;
using Onesign.Shared.Result;

namespace Onesign.Api.Controllers.Tenant;

[Route("api/tenant/org-units")]
[Route("api/tenant/orgunits")]  // Alias for frontend compatibility
public class OrgUnitsController : Onesign.Api.Controllers.TenantControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILocalizationService _localizationService;

    public OrgUnitsController(IMediator mediator, ILocalizationService localizationService)
    {
        _mediator = mediator;
        _localizationService = localizationService;
    }

    [HttpGet("tree")]
    public async Task<ActionResult<List<OrgUnitTreeNodeDto>>> GetTree([FromQuery] Guid tenantId)
    {
        var query = new GetOrgUnitTreeQuery { TenantId = tenantId };
        var result = await _mediator.Send(query);

        if (result.IsFailure)
        {
            var culture = GetCulture();
            var localizedMessage = _localizationService.GetString(result.ErrorCode ?? "UNKNOWN_ERROR", culture);
            return BadRequest(new { errorCode = result.ErrorCode, errorMessage = localizedMessage });
        }

        return Ok(result.Value);
    }

    [HttpGet("{orgUnitId}")]
    public async Task<ActionResult<OrgUnitDto>> GetDetails(Guid orgUnitId, [FromQuery] Guid tenantId)
    {
        var query = new GetOrgUnitDetailsQuery { OrgUnitId = orgUnitId, TenantId = tenantId };
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
    public async Task<ActionResult<OrgUnitDto>> Create([FromBody] CreateOrgUnitRequest request, [FromQuery] Guid tenantId)
    {
        var command = new CreateOrgUnitCommand
        {
            TenantId = tenantId,
            ParentId = request.ParentId,
            Name = request.Name,
            Code = request.Code,
            SortOrder = request.SortOrder,
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

    [HttpPut("{orgUnitId}")]
    public async Task<ActionResult<OrgUnitDto>> Update(Guid orgUnitId, [FromBody] UpdateOrgUnitRequest request, [FromQuery] Guid tenantId)
    {
        var command = new UpdateOrgUnitCommand
        {
            OrgUnitId = orgUnitId,
            TenantId = tenantId,
            Name = request.Name,
            SortOrder = request.SortOrder,
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

    [HttpPost("{orgUnitId}/move")]
    public async Task<ActionResult> Move(Guid orgUnitId, [FromBody] MoveOrgUnitRequest request, [FromQuery] Guid tenantId)
    {
        var command = new MoveOrgUnitCommand
        {
            OrgUnitId = orgUnitId,
            TenantId = tenantId,
            NewParentId = request.NewParentId,
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

    [HttpDelete("{orgUnitId}")]
    public async Task<ActionResult> Delete(Guid orgUnitId, [FromQuery] Guid tenantId)
    {
        var command = new DeleteOrgUnitCommand
        {
            OrgUnitId = orgUnitId,
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

