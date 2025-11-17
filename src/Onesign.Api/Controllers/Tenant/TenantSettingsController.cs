using MediatR;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.Tenants.Application.Commands;
using Onesign.Modules.Tenants.Application.DTOs;
using Onesign.Modules.Tenants.Application.Queries;

namespace Onesign.Api.Controllers.Tenant;

[ApiController]
[Route("api/tenant/settings")]
public class TenantSettingsController : ControllerBase
{
    private readonly IMediator _mediator;

    public TenantSettingsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<TenantSettingsDto>> GetSettings([FromQuery] Guid tenantId)
    {
        var query = new GetTenantSettingsQuery
        {
            TenantId = tenantId
        };
        var result = await _mediator.Send(query);
        
        if (result == null)
        {
            return NotFound();
        }

        return Ok(result);
    }

    [HttpPut("branding")]
    public async Task<ActionResult<TenantSettingsDto>> UpdateBranding([FromBody] UpdateBrandingRequest request, [FromQuery] Guid tenantId)
    {
        var command = new UpdateBrandingCommand
        {
            TenantId = tenantId,
            LogoUrl = request.LogoUrl,
            PrimaryColor = request.PrimaryColor
        };
        var result = await _mediator.Send(command);
        
        if (result.IsFailure)
        {
            return BadRequest(new { errorCode = result.ErrorCode, errorMessage = result.ErrorMessage });
        }

        return Ok(result.Value);
    }
}

