using MediatR;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.Observability.Application.DTOs;
using Onesign.Modules.Observability.Application.Queries;

namespace Onesign.Api.Controllers.Tenant;

[Route("api/tenant/observability")]
public class ObservabilityController : TenantControllerBase
{
    private readonly IMediator _mediator;

    public ObservabilityController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("audit/search")]
    public async Task<ActionResult<AuditSearchResultDto>> SearchAuditEvents(
        [FromQuery] Guid tenantId,
        [FromBody] AuditSearchFilterDto filter)
    {
        // Ensure filter is scoped to this tenant
        filter.TenantId = tenantId;

        var query = new SearchAuditEventsQuery { Filter = filter };
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);

        return Ok(result.Data);
    }

    [HttpGet("audit/{id}")]
    public async Task<ActionResult<AuditEventDto>> GetAuditEvent(Guid id)
    {
        var query = new GetAuditEventByIdQuery { Id = id };
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return NotFound(result.ErrorMessage);

        return Ok(result.Data);
    }
}
