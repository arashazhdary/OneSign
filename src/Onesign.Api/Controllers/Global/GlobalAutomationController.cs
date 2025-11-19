using MediatR;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.Automation.Application.Commands;
using Onesign.Modules.Automation.Application.DTOs;
using Onesign.Modules.Automation.Application.Queries;

namespace Onesign.Api.Controllers.Global;

[Route("api/global/automation")]
[ApiController]
public class GlobalAutomationController : ControllerBase
{
    private readonly IMediator _mediator;

    public GlobalAutomationController(IMediator mediator) => _mediator = mediator;

    [HttpGet("templates")]
    public async Task<ActionResult<List<AutomationWorkflowDto>>> GetTemplates()
    {
        var result = await _mediator.Send(new GetGlobalTemplatesQuery());
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.ErrorMessage);
    }

    [HttpGet("templates/{id}")]
    public async Task<ActionResult<AutomationWorkflowDto>> GetTemplate(Guid id)
    {
        var result = await _mediator.Send(new GetGlobalTemplateByIdQuery { Id = id });
        return result.IsSuccess ? Ok(result.Value) : NotFound(result.ErrorMessage);
    }

    [HttpPost("templates")]
    public async Task<ActionResult<AutomationWorkflowDto>> CreateTemplate([FromBody] CreateGlobalTemplateRequest request)
    {
        var command = new CreateGlobalTemplateCommand
        {
            UserId = request.UserId,
            Name = request.Name,
            Description = request.Description,
            Severity = request.Severity,
            TenantCanDisable = request.TenantCanDisable,
            TenantCanOverrideConditions = request.TenantCanOverrideConditions,
            Triggers = request.Triggers,
            Conditions = request.Conditions,
            Actions = request.Actions
        };

        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.ErrorMessage);
    }

    [HttpPut("templates/{id}")]
    public async Task<ActionResult<AutomationWorkflowDto>> UpdateTemplate(Guid id, [FromBody] UpdateGlobalTemplateRequest request)
    {
        var command = new UpdateGlobalTemplateCommand
        {
            Id = id,
            UserId = request.UserId,
            Name = request.Name,
            Description = request.Description,
            Severity = request.Severity,
            TenantCanDisable = request.TenantCanDisable,
            TenantCanOverrideConditions = request.TenantCanOverrideConditions,
            Triggers = request.Triggers,
            Conditions = request.Conditions,
            Actions = request.Actions
        };

        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.ErrorMessage);
    }

    [HttpDelete("templates/{id}")]
    public async Task<ActionResult> DeleteTemplate(Guid id)
    {
        var result = await _mediator.Send(new DeleteGlobalTemplateCommand { Id = id });
        return result.IsSuccess ? Ok() : BadRequest(result.ErrorMessage);
    }

    [HttpPost("templates/{id}/publish")]
    public async Task<ActionResult> PublishTemplate(Guid id, [FromQuery] Guid userId)
    {
        var result = await _mediator.Send(new PublishTemplateCommand { Id = id, UserId = userId });
        return result.IsSuccess ? Ok() : BadRequest(result.ErrorMessage);
    }

    [HttpPost("templates/{id}/enforce")]
    public async Task<ActionResult> EnforceTemplate(Guid id, [FromQuery] Guid userId)
    {
        var result = await _mediator.Send(new EnforceTemplateCommand { Id = id, UserId = userId });
        return result.IsSuccess ? Ok() : BadRequest(result.ErrorMessage);
    }

    [HttpPost("templates/{id}/unenforce")]
    public async Task<ActionResult> UnenforceTemplate(Guid id, [FromQuery] Guid userId)
    {
        var result = await _mediator.Send(new UnenforceTemplateCommand { Id = id, UserId = userId });
        return result.IsSuccess ? Ok() : BadRequest(result.ErrorMessage);
    }
}

public class CreateGlobalTemplateRequest
{
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Severity { get; set; } = "Info";
    public bool TenantCanDisable { get; set; } = true;
    public bool TenantCanOverrideConditions { get; set; } = true;
    public List<CreateTriggerDto> Triggers { get; set; } = new();
    public List<CreateConditionDto> Conditions { get; set; } = new();
    public List<CreateActionDto> Actions { get; set; } = new();
}

public class UpdateGlobalTemplateRequest
{
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Severity { get; set; } = "Info";
    public bool TenantCanDisable { get; set; } = true;
    public bool TenantCanOverrideConditions { get; set; } = true;
    public List<CreateTriggerDto> Triggers { get; set; } = new();
    public List<CreateConditionDto> Conditions { get; set; } = new();
    public List<CreateActionDto> Actions { get; set; } = new();
}
