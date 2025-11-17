using MediatR;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.Authorization.Application.DTOs;
using Onesign.Modules.Authorization.Application.Queries;

namespace Onesign.Api.Controllers.Tenant;

[Route("api/tenant/policies")]
public class PolicyController : TenantControllerBase
{
    private readonly IMediator _mediator;

    public PolicyController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<List<PolicyDefinitionDto>>> GetPolicies(
        [FromQuery] Guid tenantId,
        [FromQuery] bool? enabled)
    {
        var query = new GetPoliciesQuery
        {
            TenantId = tenantId,
            Enabled = enabled
        };

        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);

        return Ok(result.Data);
    }
}
