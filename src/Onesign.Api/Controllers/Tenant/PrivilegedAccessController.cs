using MediatR;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.PrivilegedAccess.Application.Commands;

namespace Onesign.Api.Controllers.Tenant;

[Route("api/tenant/privileged-access")]
public class PrivilegedAccessController : TenantControllerBase
{
    private readonly IMediator _mediator;

    public PrivilegedAccessController(IMediator mediator) => _mediator = mediator;

    [HttpPost("jit/request")]
    public async Task<ActionResult<Guid>> RequestJitAccess([FromBody] RequestJitAccessCommand command)
    {
        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.ErrorMessage);
    }

    [HttpGet("jit/grants")]
    public async Task<ActionResult> GetActiveJitGrants([FromQuery] Guid tenantId, [FromQuery] Guid? userId)
    {
        return Ok(new List<object>());
    }

    [HttpPost("jit/grants/{grantId}/revoke")]
    public async Task<ActionResult> RevokeJitGrant(Guid grantId)
    {
        return Ok();
    }

    [HttpGet("sessions")]
    public async Task<ActionResult> GetPrivilegedSessions([FromQuery] Guid tenantId)
    {
        return Ok(new List<object>());
    }

    [HttpPost("sessions/{sessionId}/revoke")]
    public async Task<ActionResult<bool>> RevokeSession(Guid sessionId, [FromBody] RevokePrivilegedSessionCommand command)
    {
        command.SessionId = sessionId;
        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.ErrorMessage);
    }

    [HttpGet("breakglass-accounts")]
    public async Task<ActionResult> GetBreakGlassAccounts([FromQuery] Guid tenantId)
    {
        return Ok(new List<object>());
    }

    [HttpPost("breakglass-accounts")]
    public async Task<ActionResult> CreateBreakGlassAccount([FromBody] object command)
    {
        return Ok();
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult> GetPrivilegedAccessDashboard([FromQuery] Guid tenantId)
    {
        return Ok(new
        {
            PermanentPrivilegedUsersCount = 0,
            ActiveJitGrantsCount = 0,
            BreakGlassLoginsLast30Days = 0,
            ActivePrivilegedSessions = new List<object>()
        });
    }
}
