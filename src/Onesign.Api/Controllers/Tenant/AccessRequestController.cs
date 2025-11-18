using MediatR;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.AccessRequests.Application.Commands;
using Onesign.Modules.AccessRequests.Application.DTOs;
using Onesign.Modules.AccessRequests.Application.Queries;

namespace Onesign.Api.Controllers.Tenant;

[Route("api/tenant/access-requests")]
public class AccessRequestController : TenantControllerBase
{
    private readonly IMediator _mediator;

    public AccessRequestController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<ActionResult<List<AccessRequestDto>>> GetAccessRequests(
        [FromQuery] Guid tenantId,
        [FromQuery] Guid? requesterId,
        [FromQuery] Guid? approverId)
    {
        var result = await _mediator.Send(new GetAccessRequestsQuery
        {
            TenantId = tenantId,
            RequesterId = requesterId,
            ApproverId = approverId
        });
        return result.IsSuccess ? Ok(result.Data) : BadRequest(result.ErrorMessage);
    }

    [HttpPost]
    public async Task<ActionResult<AccessRequestDto>> CreateRequest([FromBody] CreateAccessRequestCommand command)
    {
        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok(result.Data) : BadRequest(result.ErrorMessage);
    }

    [HttpPost("{requestId}/approve")]
    public async Task<ActionResult<bool>> ProcessApproval(Guid requestId, [FromBody] ProcessApprovalCommand command)
    {
        command.RequestId = requestId;
        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok(result.Data) : BadRequest(result.ErrorMessage);
    }
}
