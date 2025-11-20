using MediatR;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.Security.Application.Commands;
using Onesign.Modules.Security.Application.DTOs;
using Onesign.Modules.Security.Application.Queries;
using Onesign.Shared.Localization;

namespace Onesign.Api.Controllers.Tenant;

[Route("api/tenant/risk-events")]
public class RiskEventsController : Onesign.Api.Controllers.TenantControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILocalizationService _localizationService;

    public RiskEventsController(IMediator mediator, ILocalizationService localizationService)
    {
        _mediator = mediator;
        _localizationService = localizationService;
    }

    private string GetCultureString()
    {
        return HttpContext.Items["Culture"]?.ToString() ?? "en";
    }

    [HttpGet]
    public async Task<ActionResult<List<RiskEventDto>>> GetEvents(
        [FromQuery] Guid tenantId,
        [FromQuery] Guid? userId,
        [FromQuery] int? eventType,
        [FromQuery] int? riskLevel,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = new GetRiskEventsQuery
        {
            TenantId = tenantId,
            UserId = userId,
            EventType = eventType,
            RiskLevel = riskLevel,
            StartDate = startDate,
            EndDate = endDate,
            PageNumber = pageNumber,
            PageSize = pageSize
        };

        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> RecordEvent([FromBody] RiskEventDto eventDto)
    {
        var command = new RecordRiskEventCommand
        {
            UserId = eventDto.UserId,
            TenantId = Guid.Empty, // This should be extracted from auth context
            EventType = eventDto.EventType,
            RiskLevel = eventDto.RiskLevel,
            IpAddress = eventDto.IpAddress,
            UserAgent = eventDto.UserAgent,
            Location = eventDto.Location,
            Details = eventDto.Details
        };

        await _mediator.Send(command);
        return NoContent();
    }
}
