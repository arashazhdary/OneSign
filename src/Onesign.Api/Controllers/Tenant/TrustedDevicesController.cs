using MediatR;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.Security.Application.Commands;
using Onesign.Modules.Security.Application.DTOs;
using Onesign.Modules.Security.Application.Queries;
using Onesign.Shared.Localization;

namespace Onesign.Api.Controllers.Tenant;

[Route("api/tenant/trusted-devices")]
[Route("api/tenant/trusteddevices")]
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

    [HttpPost]
    public async Task<ActionResult> TrustDevice([FromBody] TrustDeviceRequest request)
    {
        var command = new TrustDeviceCommand
        {
            UserId = request.UserId,
            DeviceFingerprint = request.DeviceFingerprint,
            DeviceName = request.DeviceName,
            RememberDays = request.RememberDays ?? 30
        };

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
        {
            return BadRequest(new
            {
                error = result.ErrorCode,
                errorMessage = _localizationService.GetString(result.ErrorMessage, GetCultureString())
            });
        }

        return Ok(new { deviceId = result.Value });
    }

    [HttpDelete("{deviceId}")]
    public async Task<ActionResult> RemoveTrustedDevice(Guid deviceId, [FromQuery] Guid userId)
    {
        var command = new RemoveTrustedDeviceCommand
        {
            UserId = userId,
            DeviceId = deviceId
        };

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
        {
            return BadRequest(new
            {
                error = result.ErrorCode,
                errorMessage = _localizationService.GetString(result.ErrorMessage, GetCultureString())
            });
        }

        return Ok(new { success = true });
    }
}

public class TrustDeviceRequest
{
    public Guid UserId { get; set; }
    public string DeviceFingerprint { get; set; } = string.Empty;
    public string? DeviceName { get; set; }
    public int? RememberDays { get; set; }
}
