using MediatR;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.Security.Application.DTOs;
using Onesign.Modules.Security.Application.Queries;
using Onesign.Shared.Localization;

namespace Onesign.Api.Controllers.Tenant;

[Route("api/tenant/trusted-devices")]
public class TrustedDevicesController : Onesign.Api.Controllers.TenantControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILocalizationService _localizationService;

    public TrustedDevicesController(IMediator mediator, ILocalizationService localizationService)
    {
        _mediator = mediator;
        _localizationService = localizationService;
    }

    private string GetCultureString()
    {
        return HttpContext.Items["Culture"]?.ToString() ?? "en";
    }

    [HttpGet]
    public async Task<ActionResult<List<TrustedDeviceDto>>> GetDevices([FromQuery] Guid userId)
    {
        var query = new GetTrustedDevicesQuery { UserId = userId };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("check")]
    public async Task<ActionResult<bool>> CheckTrustedDevice(
        [FromQuery] Guid userId,
        [FromQuery] string deviceFingerprint)
    {
        var query = new CheckTrustedDeviceQuery
        {
            UserId = userId,
            DeviceFingerprint = deviceFingerprint
        };

        var result = await _mediator.Send(query);
        return Ok(new { trusted = result });
    }
}
