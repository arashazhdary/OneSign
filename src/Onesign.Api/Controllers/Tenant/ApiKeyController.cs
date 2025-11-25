using MediatR;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.Developer.Application.Commands;
using Onesign.Modules.Developer.Application.DTOs;
using Onesign.Modules.Developer.Application.Queries;

namespace Onesign.Api.Controllers.Tenant;

[Route("api/tenant/api-keys")]
[Route("api/tenant/apikeys")]
public class ApiKeyController : TenantControllerBase
{
    private readonly IMediator _mediator;

    public ApiKeyController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<List<ApiKeyDto>>> GetApiKeys(
        [FromQuery] Guid tenantId,
        [FromQuery] Guid? serviceAccountId)
    {
        var query = new GetApiKeysQuery
        {
            TenantId = tenantId,
            ServiceAccountId = serviceAccountId
        };

        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);

        return Ok(result.Value);
    }

    [HttpPost]
    public async Task<ActionResult<CreateApiKeyResultDto>> CreateApiKey([FromBody] CreateApiKeyCommand command)
    {
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);

        return Ok(result.Value);
    }

    [HttpPost("{id}/revoke")]
    public async Task<ActionResult> RevokeApiKey(Guid id, [FromBody] RevokeApiKeyCommand command)
    {
        command.Id = id;
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);

        return Ok();
    }
}
