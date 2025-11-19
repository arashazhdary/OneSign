using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.ChangeManagement.Application.Commands;
using Onesign.Modules.ChangeManagement.Application.DTOs;
using Onesign.Modules.ChangeManagement.Application.Queries;
using Onesign.Shared.Pagination;

namespace Onesign.Api.Controllers.Tenant;

[Route("api/tenant/change-sets")]
[Authorize]
public class ChangeSetsController : TenantControllerBase
{
    private readonly IMediator _mediator;

    public ChangeSetsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<ActionResult<PagedResult<ChangeSetDto>>> GetChangeSets(
        [FromQuery] Guid tenantId,
        [FromQuery] string? status,
        [FromQuery] string? category,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = new GetChangeSetsQuery
        {
            ScopeType = "Tenant",
            ScopeId = tenantId,
            Status = status,
            Category = category,
            PageNumber = page,
            PageSize = pageSize
        };

        var result = await _mediator.Send(query);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.ErrorMessage);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ChangeSetDetailDto>> GetChangeSet(Guid id, [FromQuery] Guid tenantId)
    {
        var query = new GetChangeSetDetailQuery
        {
            Id = id,
            ScopeType = "Tenant",
            ScopeId = tenantId
        };

        var result = await _mediator.Send(query);
        return result.IsSuccess ? Ok(result.Value) : NotFound(result.ErrorMessage);
    }

    [HttpPost]
    public async Task<ActionResult<ChangeSetDetailDto>> CreateChangeSet([FromBody] CreateChangeSetRequest request)
    {
        var command = new CreateChangeSetCommand
        {
            ScopeType = "Tenant",
            ScopeId = request.TenantId,
            UserId = request.UserId,
            Title = request.Title,
            Description = request.Description,
            Category = request.Category,
            Items = request.Items
        };

        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.ErrorMessage);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ChangeSetDetailDto>> UpdateChangeSet(Guid id, [FromBody] UpdateChangeSetRequest request)
    {
        var command = new UpdateChangeSetCommand
        {
            Id = id,
            ScopeType = "Tenant",
            ScopeId = request.TenantId,
            UserId = request.UserId,
            Title = request.Title,
            Description = request.Description,
            Category = request.Category,
            Items = request.Items
        };

        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.ErrorMessage);
    }

    [HttpPost("{id}/submit")]
    public async Task<ActionResult> SubmitChangeSet(Guid id, [FromQuery] Guid tenantId, [FromQuery] Guid userId)
    {
        var command = new SubmitChangeSetCommand
        {
            Id = id,
            ScopeType = "Tenant",
            ScopeId = tenantId,
            UserId = userId
        };

        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok() : BadRequest(result.ErrorMessage);
    }

    [HttpPost("{id}/simulate")]
    public async Task<ActionResult<SimulationResultDto>> SimulateChangeSet(Guid id, [FromQuery] Guid tenantId, [FromQuery] Guid userId)
    {
        var command = new SimulateChangeSetCommand
        {
            Id = id,
            ScopeType = "Tenant",
            ScopeId = tenantId,
            UserId = userId
        };

        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.ErrorMessage);
    }

    [HttpPost("{id}/approve")]
    public async Task<ActionResult> ApproveChangeSet(Guid id, [FromBody] ApprovalRequest request)
    {
        var command = new ApproveChangeSetCommand
        {
            Id = id,
            ScopeType = "Tenant",
            ScopeId = request.TenantId,
            UserId = request.UserId,
            Reason = request.Reason
        };

        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok() : BadRequest(result.ErrorMessage);
    }

    [HttpPost("{id}/reject")]
    public async Task<ActionResult> RejectChangeSet(Guid id, [FromBody] RejectionRequest request)
    {
        var command = new RejectChangeSetCommand
        {
            Id = id,
            ScopeType = "Tenant",
            ScopeId = request.TenantId,
            UserId = request.UserId,
            Reason = request.Reason
        };

        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok() : BadRequest(result.ErrorMessage);
    }

    [HttpPost("{id}/schedule")]
    public async Task<ActionResult> ScheduleChangeSet(Guid id, [FromBody] ScheduleRequest request)
    {
        var command = new ScheduleChangeSetCommand
        {
            Id = id,
            ScopeType = "Tenant",
            ScopeId = request.TenantId,
            UserId = request.UserId,
            ScheduledFor = request.ScheduledFor
        };

        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok() : BadRequest(result.ErrorMessage);
    }

    [HttpPost("{id}/apply")]
    public async Task<ActionResult> ApplyChangeSet(Guid id, [FromQuery] Guid tenantId, [FromQuery] Guid userId)
    {
        var command = new ApplyChangeSetCommand
        {
            Id = id,
            ScopeType = "Tenant",
            ScopeId = tenantId,
            UserId = userId
        };

        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok() : BadRequest(result.ErrorMessage);
    }

    [HttpPost("{id}/rollback")]
    public async Task<ActionResult> RollbackChangeSet(Guid id, [FromBody] RollbackRequest request)
    {
        var command = new RollbackChangeSetCommand
        {
            Id = id,
            ScopeType = "Tenant",
            ScopeId = request.TenantId,
            UserId = request.UserId,
            Reason = request.Reason
        };

        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok() : BadRequest(result.ErrorMessage);
    }

    [HttpGet("{id}/execution-log")]
    public async Task<ActionResult<List<ChangeExecutionLogDto>>> GetExecutionLog(Guid id, [FromQuery] Guid tenantId)
    {
        var query = new GetChangeExecutionLogQuery
        {
            ChangeSetId = id,
            ScopeType = "Tenant",
            ScopeId = tenantId
        };

        var result = await _mediator.Send(query);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.ErrorMessage);
    }
}

public class CreateChangeSetRequest
{
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = string.Empty;
    public List<CreateChangeItemDto> Items { get; set; } = new();
}

public class UpdateChangeSetRequest
{
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = string.Empty;
    public List<CreateChangeItemDto> Items { get; set; } = new();
}

public class ApprovalRequest
{
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public string? Reason { get; set; }
}

public class RejectionRequest
{
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public string Reason { get; set; } = string.Empty;
}

public class ScheduleRequest
{
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public DateTimeOffset ScheduledFor { get; set; }
}

public class RollbackRequest
{
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public string Reason { get; set; } = string.Empty;
}
