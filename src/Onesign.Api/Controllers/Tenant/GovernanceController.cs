using MediatR;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.Governance.Application.Commands;
using Onesign.Modules.Governance.Application.DTOs;
using Onesign.Modules.Governance.Application.Queries;

namespace Onesign.Api.Controllers.Tenant;

[Route("api/tenant/governance")]
public class GovernanceController : TenantControllerBase
{
    private readonly IMediator _mediator;

    public GovernanceController(IMediator mediator) => _mediator = mediator;

    [HttpGet("campaigns")]
    public async Task<ActionResult<List<CampaignDto>>> GetCampaigns([FromQuery] Guid tenantId)
    {
        var result = await _mediator.Send(new GetCampaignsQuery { TenantId = tenantId });
        return result.IsSuccess ? Ok(result.Data) : BadRequest(result.ErrorMessage);
    }

    [HttpPost("campaigns")]
    public async Task<ActionResult<CampaignDto>> CreateCampaign([FromBody] CreateAccessReviewCampaignCommand command)
    {
        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok(result.Data) : BadRequest(result.ErrorMessage);
    }
}
