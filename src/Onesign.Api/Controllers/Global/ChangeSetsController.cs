using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.ChangeManagement.Application.Commands;
using Onesign.Modules.ChangeManagement.Application.DTOs;
using Onesign.Modules.ChangeManagement.Application.Queries;
using Onesign.Shared.Pagination;

namespace Onesign.Api.Controllers.Global;

[Route("api/global/change-sets")]
[ApiController]
[Authorize(Roles = "GlobalAdmin")]
public class ChangeSetsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ChangeSetsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<ActionResult<PagedResult<ChangeSetDto>>> GetChangeSets(
        [FromQuery] string? status,
        [FromQuery] string? category,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = new GetChangeSetsQuery
        {
            ScopeType = "Global",
            ScopeId = Guid.Empty,
            Status = status,
            Category = category,
            PageNumber = page,
            PageSize = pageSize
        };

        var result = await _mediator.Send(query);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.ErrorMessage);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ChangeSetDetailDto>> GetChangeSet(Guid id)
    {
        var query = new GetChangeSetDetailQuery
        {
            Id = id,
            ScopeType = "Global",
            ScopeId = Guid.Empty
        };

        var result = await _mediator.Send(query);
        return result.IsSuccess ? Ok(result.Value) : NotFound(result.ErrorMessage);
    }

    [HttpPost]
    public async Task<ActionResult<ChangeSetDetailDto>> CreateChangeSet([FromBody] CreateGlobalChangeSetRequest request)
    {
        var command = new CreateChangeSetCommand
        {
            ScopeType = "Global",
            ScopeId = Guid.Empty,
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
    public async Task<ActionResult<ChangeSetDetailDto>> UpdateChangeSet(Guid id, [FromBody] UpdateGlobalChangeSetRequest request)
    {
        var command = new UpdateChangeSetCommand
        {
            Id = id,
            ScopeType = "Global",
            ScopeId = Guid.Empty,
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
    public async Task<ActionResult> SubmitChangeSet(Guid id, [FromQuery] Guid userId)
    {
        var command = new SubmitChangeSetCommand
        {
            Id = id,
            ScopeType = "Global",
            ScopeId = Guid.Empty,
            UserId = userId
        };

        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok() : BadRequest(result.ErrorMessage);
    }

    [HttpPost("{id}/simulate")]
    public async Task<ActionResult<SimulationResultDto>> SimulateChangeSet(Guid id, [FromQuery] Guid userId)
    {
        var command = new SimulateChangeSetCommand
        {
            Id = id,
            ScopeType = "Global",
            ScopeId = Guid.Empty,
            UserId = userId
        };

        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.ErrorMessage);
    }

    [HttpPost("{id}/approve")]
    public async Task<ActionResult> ApproveChangeSet(Guid id, [FromBody] GlobalApprovalRequest request)
    {
        var command = new ApproveChangeSetCommand
        {
            Id = id,
            ScopeType = "Global",
            ScopeId = Guid.Empty,
            UserId = request.UserId,
            Reason = request.Reason
        };

        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok() : BadRequest(result.ErrorMessage);
    }

    [HttpPost("{id}/reject")]
    public async Task<ActionResult> RejectChangeSet(Guid id, [FromBody] GlobalRejectionRequest request)
    {
        var command = new RejectChangeSetCommand
        {
            Id = id,
            ScopeType = "Global",
            ScopeId = Guid.Empty,
            UserId = request.UserId,
            Reason = request.Reason
        };

        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok() : BadRequest(result.ErrorMessage);
    }

    [HttpPost("{id}/schedule")]
    public async Task<ActionResult> ScheduleChangeSet(Guid id, [FromBody] GlobalScheduleRequest request)
    {
        var command = new ScheduleChangeSetCommand
        {
            Id = id,
            ScopeType = "Global",
            ScopeId = Guid.Empty,
            UserId = request.UserId,
            ScheduledFor = request.ScheduledFor
        };

        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok() : BadRequest(result.ErrorMessage);
    }

    [HttpPost("{id}/apply")]
    public async Task<ActionResult> ApplyChangeSet(Guid id, [FromQuery] Guid userId)
    {
        var command = new ApplyChangeSetCommand
        {
            Id = id,
            ScopeType = "Global",
            ScopeId = Guid.Empty,
            UserId = userId
        };

        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok() : BadRequest(result.ErrorMessage);
    }

    [HttpPost("{id}/rollback")]
    public async Task<ActionResult> RollbackChangeSet(Guid id, [FromBody] GlobalRollbackRequest request)
    {
        var command = new RollbackChangeSetCommand
        {
            Id = id,
            ScopeType = "Global",
            ScopeId = Guid.Empty,
            UserId = request.UserId,
            Reason = request.Reason
        };

        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok() : BadRequest(result.ErrorMessage);
    }

    [HttpGet("{id}/execution-log")]
    public async Task<ActionResult<List<ChangeExecutionLogDto>>> GetExecutionLog(Guid id)
    {
        var query = new GetChangeExecutionLogQuery
        {
            ChangeSetId = id,
            ScopeType = "Global",
            ScopeId = Guid.Empty
        };

        var result = await _mediator.Send(query);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.ErrorMessage);
    }
}

public class CreateGlobalChangeSetRequest
{
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = string.Empty;
    public List<CreateChangeItemDto> Items { get; set; } = new();
}

public class UpdateGlobalChangeSetRequest
{
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = string.Empty;
    public List<CreateChangeItemDto> Items { get; set; } = new();
}

public class GlobalApprovalRequest
{
    public Guid UserId { get; set; }
    public string? Reason { get; set; }
}

public class GlobalRejectionRequest
{
    public Guid UserId { get; set; }
    public string Reason { get; set; } = string.Empty;
}

public class GlobalScheduleRequest
{
    public Guid UserId { get; set; }
    public DateTimeOffset ScheduledFor { get; set; }
}

public class GlobalRollbackRequest
{
    public Guid UserId { get; set; }
    public string Reason { get; set; } = string.Empty;
}
