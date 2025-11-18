using MediatR;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.Developer.Application.Commands;
using Onesign.Modules.Developer.Application.DTOs;
using Onesign.Modules.Developer.Application.Queries;

namespace Onesign.Api.Controllers.Tenant;

[Route("api/tenant/service-accounts")]
public class ServiceAccountController : TenantControllerBase
{
    private readonly IMediator _mediator;

    public ServiceAccountController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<List<ServiceAccountDto>>> GetServiceAccounts([FromQuery] Guid tenantId)
    {
        var query = new GetServiceAccountsQuery { TenantId = tenantId };
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);

        return Ok(result.Data);
    }

    [HttpPost]
    public async Task<ActionResult<ServiceAccountDto>> CreateServiceAccount([FromBody] CreateServiceAccountCommand command)
    {
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);

        return Ok(result.Data);
    }
}
