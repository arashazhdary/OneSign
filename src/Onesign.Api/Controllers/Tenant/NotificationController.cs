using MediatR;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.NotificationCenter.Application.Commands;
using Onesign.Modules.NotificationCenter.Application.DTOs;
using Onesign.Modules.NotificationCenter.Application.Queries;

namespace Onesign.Api.Controllers.Tenant;

[Route("api/tenant/notifications")]
public class NotificationController : TenantControllerBase
{
    private readonly IMediator _mediator;

    public NotificationController(IMediator mediator) => _mediator = mediator;

    [HttpGet("templates")]
    public async Task<ActionResult<List<NotificationTemplateDto>>> GetTemplates([FromQuery] Guid tenantId)
    {
        var result = await _mediator.Send(new GetTemplatesQuery { TenantId = tenantId });
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.ErrorMessage);
    }

    [HttpPost("templates")]
    public async Task<ActionResult<NotificationTemplateDto>> CreateTemplate([FromBody] CreateTemplateCommand command)
    {
        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.ErrorMessage);
    }

    [HttpGet]
    public async Task<ActionResult<List<NotificationDto>>> GetNotifications([FromQuery] Guid tenantId, [FromQuery] Guid? userId)
    {
        var result = await _mediator.Send(new GetNotificationsQuery { TenantId = tenantId, UserId = userId });
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.ErrorMessage);
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> SendNotification([FromBody] SendNotificationCommand command)
    {
        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.ErrorMessage);
    }
}
