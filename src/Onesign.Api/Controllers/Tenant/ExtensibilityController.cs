using MediatR;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.Extensibility.Application.Commands;

namespace Onesign.Api.Controllers.Tenant;

[Route("api/tenant/extensibility")]
public class ExtensibilityController : TenantControllerBase
{
    private readonly IMediator _mediator;

    public ExtensibilityController(IMediator mediator) => _mediator = mediator;

    // Webhooks
    [HttpGet("webhooks")]
    public async Task<ActionResult> GetWebhooks([FromQuery] Guid tenantId)
    {
        return Ok(new List<object>());
    }

    [HttpPost("webhooks")]
    public async Task<ActionResult<Guid>> CreateWebhook([FromBody] CreateWebhookCommand command)
    {
        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok(result.Data) : BadRequest(result.ErrorMessage);
    }

    [HttpPut("webhooks/{id}")]
    public async Task<ActionResult> UpdateWebhook(Guid id, [FromBody] object command)
    {
        return Ok();
    }

    [HttpDelete("webhooks/{id}")]
    public async Task<ActionResult> DeleteWebhook(Guid id)
    {
        return Ok();
    }

    // Login Hooks
    [HttpGet("login-hooks")]
    public async Task<ActionResult> GetLoginHooks([FromQuery] Guid tenantId)
    {
        return Ok(new List<object>());
    }

    [HttpPost("login-hooks")]
    public async Task<ActionResult<Guid>> CreateLoginHook([FromBody] CreateLoginHookCommand command)
    {
        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok(result.Data) : BadRequest(result.ErrorMessage);
    }

    [HttpPut("login-hooks/{id}")]
    public async Task<ActionResult> UpdateLoginHook(Guid id, [FromBody] object command)
    {
        return Ok();
    }

    [HttpDelete("login-hooks/{id}")]
    public async Task<ActionResult> DeleteLoginHook(Guid id)
    {
        return Ok();
    }

    // Token Rules
    [HttpGet("token-rules")]
    public async Task<ActionResult> GetTokenRules([FromQuery] Guid tenantId)
    {
        return Ok(new List<object>());
    }

    [HttpPost("token-rules")]
    public async Task<ActionResult> CreateTokenRule([FromBody] object command)
    {
        return Ok();
    }

    [HttpPut("token-rules/{id}")]
    public async Task<ActionResult> UpdateTokenRule(Guid id, [FromBody] object command)
    {
        return Ok();
    }

    [HttpDelete("token-rules/{id}")]
    public async Task<ActionResult> DeleteTokenRule(Guid id)
    {
        return Ok();
    }

    // Event Types Documentation
    [HttpGet("event-types")]
    public ActionResult GetEventTypes()
    {
        var eventTypes = new[]
        {
            new { Name = "identity.user.created", Description = "Fired when a new user is created" },
            new { Name = "identity.user.updated", Description = "Fired when a user is updated" },
            new { Name = "identity.user.deleted", Description = "Fired when a user is deleted" },
            new { Name = "auth.login.succeeded", Description = "Fired on successful login" },
            new { Name = "auth.login.failed", Description = "Fired on failed login attempt" },
            new { Name = "auth.token.issued", Description = "Fired when a token is issued" },
            new { Name = "access.request.approved", Description = "Fired when access request is approved" },
            new { Name = "lifecycle.event.executed", Description = "Fired when lifecycle event is processed" }
        };
        return Ok(eventTypes);
    }
}
