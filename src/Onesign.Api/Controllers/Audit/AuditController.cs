using MediatR;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.Audit.Application.Queries;
using Onesign.Modules.Audit.Domain.Enums;
using Onesign.Shared.Pagination;

namespace Onesign.Api.Controllers.Audit;

[ApiController]
[Route("api/tenant/audit")]
public class AuditController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuditController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult> GetAuditEvents(
        [FromQuery] Guid tenantId,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] AuditEventType? eventType,
        [FromQuery] Guid? actorId,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var query = new GetAuditEventsQuery
        {
            TenantId = tenantId,
            FromDate = fromDate,
            ToDate = toDate,
            EventType = eventType,
            ActorId = actorId,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
        var result = await _mediator.Send(query);
        return Ok(result);
    }
}

