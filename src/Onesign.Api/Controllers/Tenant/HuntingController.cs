using MediatR;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.Hunting.Application.Commands;
using Onesign.Modules.Hunting.Application.DTOs;
using Onesign.Modules.Hunting.Application.Queries;
using Onesign.Shared.Pagination;

namespace Onesign.Api.Controllers.Tenant;

[Route("api/tenant/hunting")]
public class HuntingController : TenantControllerBase
{
    private readonly IMediator _mediator;

    public HuntingController(IMediator mediator)
    {
        _mediator = mediator;
    }

    #region Query Execution

    [HttpPost("query")]
    public async Task<ActionResult<HuntResultDto>> ExecuteQuery([FromBody] ExecuteQueryRequest request)
    {
        var query = new ExecuteOqlQuery
        {
            ScopeType = "Tenant",
            ScopeId = request.TenantId == Guid.Empty ? GetCurrentTenantId() : request.TenantId,
            Query = request.Query
        };

        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);

        return Ok(result.Data);
    }

    #endregion

    #region Saved Queries

    [HttpGet("saved-queries")]
    public async Task<ActionResult<PagedResult<SavedQueryDto>>> GetSavedQueries(
        [FromQuery] Guid tenantId,
        [FromQuery] string? dataset,
        [FromQuery] bool? isEnabled,
        [FromQuery] string? searchTerm,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = new GetSavedQueriesQuery
        {
            ScopeType = "Tenant",
            ScopeId = tenantId == Guid.Empty ? GetCurrentTenantId() : tenantId,
            Dataset = dataset,
            IsEnabled = isEnabled,
            SearchTerm = searchTerm,
            PageNumber = pageNumber,
            PageSize = pageSize
        };

        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);

        return Ok(result.Data);
    }

    [HttpGet("saved-queries/{id}")]
    public async Task<ActionResult<SavedQueryDto>> GetSavedQuery(Guid id, [FromQuery] Guid tenantId)
    {
        var query = new GetSavedQueryDetailQuery
        {
            Id = id,
            ScopeType = "Tenant",
            ScopeId = tenantId == Guid.Empty ? GetCurrentTenantId() : tenantId
        };

        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return NotFound(result.ErrorMessage);

        return Ok(result.Data);
    }

    [HttpPost("saved-queries")]
    public async Task<ActionResult<SavedQueryDto>> CreateSavedQuery([FromBody] CreateSavedQueryRequest request)
    {
        var command = new CreateSavedQueryCommand
        {
            ScopeType = "Tenant",
            ScopeId = request.TenantId == Guid.Empty ? GetCurrentTenantId() : request.TenantId,
            UserId = GetCurrentUserId(),
            Name = request.Name,
            Description = request.Description,
            Dataset = request.Dataset,
            QueryDslJson = request.QueryDslJson,
            IsGlobalTemplate = request.IsGlobalTemplate,
            IsEnabled = request.IsEnabled
        };

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);

        return CreatedAtAction(nameof(GetSavedQuery), new { id = result.Data!.Id }, result.Data);
    }

    [HttpPut("saved-queries/{id}")]
    public async Task<ActionResult<SavedQueryDto>> UpdateSavedQuery(Guid id, [FromBody] UpdateSavedQueryRequest request)
    {
        var command = new UpdateSavedQueryCommand
        {
            Id = id,
            ScopeType = "Tenant",
            ScopeId = request.TenantId == Guid.Empty ? GetCurrentTenantId() : request.TenantId,
            UserId = GetCurrentUserId(),
            Name = request.Name,
            Description = request.Description,
            Dataset = request.Dataset,
            QueryDslJson = request.QueryDslJson,
            IsGlobalTemplate = request.IsGlobalTemplate,
            IsEnabled = request.IsEnabled
        };

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);

        return Ok(result.Data);
    }

    [HttpDelete("saved-queries/{id}")]
    public async Task<IActionResult> DeleteSavedQuery(Guid id, [FromQuery] Guid tenantId)
    {
        var command = new DeleteSavedQueryCommand
        {
            Id = id,
            ScopeType = "Tenant",
            ScopeId = tenantId == Guid.Empty ? GetCurrentTenantId() : tenantId
        };

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);

        return NoContent();
    }

    #endregion

    #region Scheduled Hunts

    [HttpGet("scheduled-hunts")]
    public async Task<ActionResult<PagedResult<ScheduledHuntDto>>> GetScheduledHunts(
        [FromQuery] Guid tenantId,
        [FromQuery] string? scheduleSpec,
        [FromQuery] bool? isEnabled,
        [FromQuery] Guid? savedQueryId,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = new GetScheduledHuntsQuery
        {
            ScopeType = "Tenant",
            ScopeId = tenantId == Guid.Empty ? GetCurrentTenantId() : tenantId,
            ScheduleSpec = scheduleSpec,
            IsEnabled = isEnabled,
            SavedQueryId = savedQueryId,
            PageNumber = pageNumber,
            PageSize = pageSize
        };

        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);

        return Ok(result.Data);
    }

    [HttpGet("scheduled-hunts/{id}")]
    public async Task<ActionResult<ScheduledHuntDto>> GetScheduledHunt(Guid id, [FromQuery] Guid tenantId)
    {
        var query = new GetScheduledHuntsQuery
        {
            ScopeType = "Tenant",
            ScopeId = tenantId == Guid.Empty ? GetCurrentTenantId() : tenantId,
            PageNumber = 1,
            PageSize = 1
        };

        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);

        var hunt = result.Data?.Items.FirstOrDefault(h => h.Id == id);
        if (hunt == null)
            return NotFound();

        return Ok(hunt);
    }

    [HttpPost("scheduled-hunts")]
    public async Task<ActionResult<ScheduledHuntDto>> CreateScheduledHunt([FromBody] CreateScheduledHuntRequest request)
    {
        var command = new CreateScheduledHuntCommand
        {
            ScopeType = "Tenant",
            ScopeId = request.TenantId == Guid.Empty ? GetCurrentTenantId() : request.TenantId,
            UserId = GetCurrentUserId(),
            SavedQueryId = request.SavedQueryId,
            Name = request.Name,
            Description = request.Description,
            ScheduleSpec = request.ScheduleSpec,
            IsEnabled = request.IsEnabled,
            MinMatchCountForFinding = request.MinMatchCountForFinding,
            MaxRowsToScan = request.MaxRowsToScan,
            TimeWindowMinutes = request.TimeWindowMinutes,
            Actions = request.Actions
        };

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);

        return CreatedAtAction(nameof(GetScheduledHunt), new { id = result.Data!.Id }, result.Data);
    }

    [HttpPut("scheduled-hunts/{id}")]
    public async Task<ActionResult<ScheduledHuntDto>> UpdateScheduledHunt(Guid id, [FromBody] UpdateScheduledHuntRequest request)
    {
        var command = new UpdateScheduledHuntCommand
        {
            Id = id,
            ScopeType = "Tenant",
            ScopeId = request.TenantId == Guid.Empty ? GetCurrentTenantId() : request.TenantId,
            UserId = GetCurrentUserId(),
            SavedQueryId = request.SavedQueryId,
            Name = request.Name,
            Description = request.Description,
            ScheduleSpec = request.ScheduleSpec,
            IsEnabled = request.IsEnabled,
            MinMatchCountForFinding = request.MinMatchCountForFinding,
            MaxRowsToScan = request.MaxRowsToScan,
            TimeWindowMinutes = request.TimeWindowMinutes,
            Actions = request.Actions
        };

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);

        return Ok(result.Data);
    }

    [HttpDelete("scheduled-hunts/{id}")]
    public async Task<IActionResult> DeleteScheduledHunt(Guid id, [FromQuery] Guid tenantId)
    {
        var command = new DeleteScheduledHuntCommand
        {
            Id = id,
            ScopeType = "Tenant",
            ScopeId = tenantId == Guid.Empty ? GetCurrentTenantId() : tenantId
        };

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);

        return NoContent();
    }

    [HttpGet("scheduled-hunts/{id}/runs")]
    public async Task<ActionResult<PagedResult<HuntRunDto>>> GetScheduledHuntRuns(
        Guid id,
        [FromQuery] Guid tenantId,
        [FromQuery] string? status,
        [FromQuery] DateTimeOffset? fromDate,
        [FromQuery] DateTimeOffset? toDate,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = new GetHuntRunsQuery
        {
            ScopeType = "Tenant",
            ScopeId = tenantId == Guid.Empty ? GetCurrentTenantId() : tenantId,
            ScheduledHuntId = id,
            Status = status,
            FromDate = fromDate,
            ToDate = toDate,
            PageNumber = pageNumber,
            PageSize = pageSize
        };

        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(result.ErrorMessage);

        return Ok(result.Data);
    }

    #endregion

    #region Hunt Runs

    [HttpGet("hunt-runs/{runId}")]
    public async Task<ActionResult<HuntRunDto>> GetHuntRun(Guid runId, [FromQuery] Guid tenantId)
    {
        var query = new GetHuntRunDetailQuery
        {
            Id = runId,
            ScopeType = "Tenant",
            ScopeId = tenantId == Guid.Empty ? GetCurrentTenantId() : tenantId
        };

        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return NotFound(result.ErrorMessage);

        return Ok(result.Data);
    }

    #endregion
}

public record ExecuteQueryRequest(
    Guid TenantId,
    OqlQueryDto Query
);

public record CreateSavedQueryRequest(
    Guid TenantId,
    string Name,
    string? Description,
    string Dataset,
    string QueryDslJson,
    bool IsGlobalTemplate,
    bool IsEnabled = true
);

public record UpdateSavedQueryRequest(
    Guid TenantId,
    string Name,
    string? Description,
    string Dataset,
    string QueryDslJson,
    bool IsGlobalTemplate,
    bool IsEnabled
);

public record CreateScheduledHuntRequest(
    Guid TenantId,
    Guid SavedQueryId,
    string Name,
    string? Description,
    string ScheduleSpec,
    bool IsEnabled,
    int MinMatchCountForFinding,
    int MaxRowsToScan,
    int TimeWindowMinutes,
    HuntActionConfigDto? Actions
);

public record UpdateScheduledHuntRequest(
    Guid TenantId,
    Guid SavedQueryId,
    string Name,
    string? Description,
    string ScheduleSpec,
    bool IsEnabled,
    int MinMatchCountForFinding,
    int MaxRowsToScan,
    int TimeWindowMinutes,
    HuntActionConfigDto? Actions
);
