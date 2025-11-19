using MediatR;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.Automation.Application.Commands;
using Onesign.Modules.Automation.Application.DTOs;
using Onesign.Modules.Automation.Application.Queries;

namespace Onesign.Api.Controllers.Tenant;

[Route("api/tenant/automation")]
public class AutomationController : TenantControllerBase
{
    private readonly IMediator _mediator;

    public AutomationController(IMediator mediator) => _mediator = mediator;

    [HttpGet("workflows")]
    public async Task<ActionResult<List<AutomationWorkflowDto>>> GetWorkflows([FromQuery] Guid tenantId)
    {
        var result = await _mediator.Send(new GetWorkflowsQuery { TenantId = tenantId });
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.ErrorMessage);
    }

    [HttpGet("workflows/{id}")]
    public async Task<ActionResult<AutomationWorkflowDto>> GetWorkflow(Guid id, [FromQuery] Guid tenantId)
    {
        var result = await _mediator.Send(new GetWorkflowByIdQuery { Id = id, TenantId = tenantId });
        return result.IsSuccess ? Ok(result.Value) : NotFound(result.ErrorMessage);
    }

    [HttpPost("workflows")]
    public async Task<ActionResult<AutomationWorkflowDto>> CreateWorkflow([FromBody] CreateWorkflowRequest request)
    {
        var command = new CreateWorkflowCommand
        {
            TenantId = request.TenantId,
            UserId = request.UserId,
            Name = request.Name,
            Description = request.Description,
            Severity = request.Severity,
            IsEnabled = request.IsEnabled,
            Triggers = request.Triggers,
            Conditions = request.Conditions,
            Actions = request.Actions
        };

        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.ErrorMessage);
    }

    [HttpPut("workflows/{id}")]
    public async Task<ActionResult<AutomationWorkflowDto>> UpdateWorkflow(Guid id, [FromBody] UpdateWorkflowRequest request)
    {
        var command = new UpdateWorkflowCommand
        {
            Id = id,
            TenantId = request.TenantId,
            UserId = request.UserId,
            Name = request.Name,
            Description = request.Description,
            Severity = request.Severity,
            IsEnabled = request.IsEnabled,
            Triggers = request.Triggers,
            Conditions = request.Conditions,
            Actions = request.Actions
        };

        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.ErrorMessage);
    }

    [HttpDelete("workflows/{id}")]
    public async Task<ActionResult> DeleteWorkflow(Guid id, [FromQuery] Guid tenantId)
    {
        var result = await _mediator.Send(new DeleteWorkflowCommand { Id = id, TenantId = tenantId });
        return result.IsSuccess ? Ok() : BadRequest(result.ErrorMessage);
    }

    [HttpPost("workflows/{id}/enable")]
    public async Task<ActionResult> EnableWorkflow(Guid id, [FromQuery] Guid tenantId, [FromQuery] Guid userId)
    {
        var result = await _mediator.Send(new EnableWorkflowCommand { Id = id, TenantId = tenantId, UserId = userId });
        return result.IsSuccess ? Ok() : BadRequest(result.ErrorMessage);
    }

    [HttpPost("workflows/{id}/disable")]
    public async Task<ActionResult> DisableWorkflow(Guid id, [FromQuery] Guid tenantId, [FromQuery] Guid userId)
    {
        var result = await _mediator.Send(new DisableWorkflowCommand { Id = id, TenantId = tenantId, UserId = userId });
        return result.IsSuccess ? Ok() : BadRequest(result.ErrorMessage);
    }

    [HttpPost("workflows/{id}/test")]
    public async Task<ActionResult<WorkflowTestResultDto>> TestWorkflow(Guid id, [FromBody] TestWorkflowRequest request)
    {
        var command = new TestWorkflowCommand
        {
            Id = id,
            TenantId = request.TenantId,
            TestPayloadJson = request.TestPayloadJson
        };

        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.ErrorMessage);
    }

    [HttpGet("executions")]
    public async Task<ActionResult<PaginatedResultDto<AutomationExecutionDto>>> GetExecutions(
        [FromQuery] Guid tenantId,
        [FromQuery] Guid? workflowId,
        [FromQuery] string? status,
        [FromQuery] DateTimeOffset? from,
        [FromQuery] DateTimeOffset? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = new GetExecutionsQuery
        {
            TenantId = tenantId,
            WorkflowId = workflowId,
            Status = status,
            From = from,
            To = to,
            Page = page,
            PageSize = pageSize
        };

        var result = await _mediator.Send(query);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.ErrorMessage);
    }

    [HttpGet("executions/{id}")]
    public async Task<ActionResult<AutomationExecutionDto>> GetExecution(Guid id, [FromQuery] Guid tenantId)
    {
        var result = await _mediator.Send(new GetExecutionByIdQuery { Id = id, TenantId = tenantId });
        return result.IsSuccess ? Ok(result.Value) : NotFound(result.ErrorMessage);
    }

    [HttpGet("templates")]
    public async Task<ActionResult<List<AutomationWorkflowDto>>> GetAvailableTemplates()
    {
        var result = await _mediator.Send(new GetGlobalTemplatesQuery());
        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);

        var enabledTemplates = result.Value?.Where(t => t.IsEnabled).ToList() ?? new List<AutomationWorkflowDto>();
        return Ok(enabledTemplates);
    }

    [HttpPost("templates/{templateId}/clone")]
    public async Task<ActionResult<AutomationWorkflowDto>> CloneTemplate(Guid templateId, [FromBody] CloneTemplateRequest request)
    {
        var command = new CloneTemplateCommand
        {
            TemplateId = templateId,
            TenantId = request.TenantId,
            UserId = request.UserId,
            CustomName = request.CustomName
        };

        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.ErrorMessage);
    }
}

public class CreateWorkflowRequest
{
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Severity { get; set; } = "Info";
    public bool IsEnabled { get; set; }
    public List<CreateTriggerDto> Triggers { get; set; } = new();
    public List<CreateConditionDto> Conditions { get; set; } = new();
    public List<CreateActionDto> Actions { get; set; } = new();
}

public class UpdateWorkflowRequest
{
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Severity { get; set; } = "Info";
    public bool IsEnabled { get; set; }
    public List<CreateTriggerDto> Triggers { get; set; } = new();
    public List<CreateConditionDto> Conditions { get; set; } = new();
    public List<CreateActionDto> Actions { get; set; } = new();
}

public class TestWorkflowRequest
{
    public Guid TenantId { get; set; }
    public string TestPayloadJson { get; set; } = "{}";
}

public class CloneTemplateRequest
{
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public string? CustomName { get; set; }
}
