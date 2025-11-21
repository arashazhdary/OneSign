using MediatR;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.Observability.Application.DTOs;
using Onesign.Modules.Observability.Application.Queries;

namespace Onesign.Api.Controllers.Global;

[Route("api/global/observability")]
public class GlobalObservabilityController : GlobalControllerBase
{
    private readonly IMediator _mediator;

    public GlobalObservabilityController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("audit/search")]
    public async Task<ActionResult<AuditSearchResultDto>> SearchAuditEvents([FromBody] AuditSearchFilterDto filter)
    {
        // Global admin can search across all tenants
        var query = new SearchAuditEventsQuery { Filter = filter };
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);

        return Ok(result.Value);
    }

    [HttpGet("audit/{id}")]
    public async Task<ActionResult<AuditEventDto>> GetAuditEvent(Guid id)
    {
        var query = new GetAuditEventByIdQuery { Id = id };
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return NotFound(result.ErrorMessage);

        return Ok(result.Value);
    }
}
