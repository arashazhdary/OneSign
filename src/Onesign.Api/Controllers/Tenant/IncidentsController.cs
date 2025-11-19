using MediatR;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.Incidents.Application.Commands;
using Onesign.Modules.Incidents.Application.DTOs;
using Onesign.Modules.Incidents.Application.Queries;
using Onesign.Modules.Incidents.Domain.Enums;

namespace Onesign.Api.Controllers.Tenant;

[Route("api/tenant/incidents")]
public class IncidentsController : TenantControllerBase
{
    private readonly IMediator _mediator;

    public IncidentsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<IncidentListDto>> GetIncidents(
        [FromQuery] Guid tenantId,
        [FromQuery] IncidentStatus? status,
        [FromQuery] IncidentSeverity? severity,
        [FromQuery] IncidentCategory? category,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = new GetIncidentsQuery
        {
            TenantId = tenantId == Guid.Empty ? GetCurrentTenantId() : tenantId,
            Status = status,
            Severity = severity,
            Category = category,
            From = from,
            To = to,
            Page = page,
            PageSize = pageSize
        };

        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<IncidentDetailDto>> GetIncident(Guid id)
    {
        var query = new GetIncidentDetailQuery
        {
            Id = id,
            IncludeEvents = true,
            IncludeEntities = true,
            IncludeNotes = true,
            IncludePlaybookRuns = true,
            IncludeTimeline = true
        };

        var result = await _mediator.Send(query);
        if (result == null)
            return NotFound();

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<IncidentDto>> CreateIncident([FromBody] CreateIncidentRequest request)
    {
        var command = new CreateIncidentCommand
        {
            TenantId = request.TenantId == Guid.Empty ? GetCurrentTenantId() : request.TenantId,
            Title = request.Title,
            Description = request.Description,
            Category = request.Category,
            Severity = request.Severity,
            DetectionSource = request.DetectionSource,
            PrimaryUserId = request.PrimaryUserId,
            PrimaryAppId = request.PrimaryAppId,
            AffectedUsersCount = request.AffectedUsersCount,
            AffectedAppsCount = request.AffectedAppsCount,
            InitialEvents = request.InitialEvents ?? new(),
            RelatedEntities = request.RelatedEntities ?? new()
        };

        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetIncident), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<IncidentDto>> UpdateIncident(Guid id, [FromBody] UpdateIncidentRequest request)
    {
        var command = new UpdateIncidentCommand
        {
            Id = id,
            Title = request.Title,
            Description = request.Description,
            Category = request.Category,
            Severity = request.Severity,
            AffectedUsersCount = request.AffectedUsersCount,
            AffectedAppsCount = request.AffectedAppsCount,
            UpdatedByUserId = GetCurrentUserId()
        };

        var result = await _mediator.Send(command);
        if (result == null)
            return NotFound();

        return Ok(result);
    }

    [HttpPost("{id}/acknowledge")]
    public async Task<ActionResult<IncidentDto>> AcknowledgeIncident(Guid id, [FromBody] AcknowledgeIncidentRequest request)
    {
        var command = new AcknowledgeIncidentCommand
        {
            Id = id,
            AcknowledgedByUserId = GetCurrentUserId(),
            Note = request.Note
        };

        var result = await _mediator.Send(command);
        if (result == null)
            return NotFound();

        return Ok(result);
    }

    [HttpPost("{id}/assign")]
    public async Task<ActionResult<IncidentDto>> AssignIncident(Guid id, [FromBody] AssignIncidentRequest request)
    {
        var command = new AssignIncidentCommand
        {
            Id = id,
            AssignToUserId = request.AssignToUserId,
            AssignedByUserId = GetCurrentUserId(),
            Note = request.Note
        };

        var result = await _mediator.Send(command);
        if (result == null)
            return NotFound();

        return Ok(result);
    }

    [HttpPost("{id}/status")]
    public async Task<ActionResult<IncidentDto>> UpdateIncidentStatus(Guid id, [FromBody] UpdateIncidentStatusRequest request)
    {
        var command = new UpdateIncidentStatusCommand
        {
            Id = id,
            Status = request.Status,
            UpdatedByUserId = GetCurrentUserId(),
            Note = request.Note
        };

        var result = await _mediator.Send(command);
        if (result == null)
            return NotFound();

        return Ok(result);
    }

    [HttpPost("{id}/resolve")]
    public async Task<ActionResult<IncidentDto>> ResolveIncident(Guid id, [FromBody] ResolveIncidentRequest request)
    {
        var command = new ResolveIncidentCommand
        {
            Id = id,
            ResolvedByUserId = GetCurrentUserId(),
            ResolutionSummary = request.ResolutionSummary
        };

        var result = await _mediator.Send(command);
        if (result == null)
            return NotFound();

        return Ok(result);
    }

    [HttpPost("{id}/close")]
    public async Task<ActionResult<IncidentDto>> CloseIncident(Guid id, [FromBody] CloseIncidentRequest request)
    {
        var command = new CloseIncidentCommand
        {
            Id = id,
            ClosedByUserId = GetCurrentUserId(),
            FinalNote = request.FinalNote
        };

        var result = await _mediator.Send(command);
        if (result == null)
            return NotFound();

        return Ok(result);
    }

    [HttpPost("{id}/notes")]
    public async Task<ActionResult<IncidentNoteDto>> AddIncidentNote(Guid id, [FromBody] AddIncidentNoteRequest request)
    {
        var command = new AddIncidentNoteCommand
        {
            IncidentId = id,
            Content = request.Content,
            CreatedByUserId = GetCurrentUserId()
        };

        var result = await _mediator.Send(command);
        if (result == null)
            return NotFound();

        return Ok(result);
    }

    [HttpPost("{id}/entities")]
    public async Task<ActionResult<IncidentEntityDto>> LinkEntityToIncident(Guid id, [FromBody] LinkEntityRequest request)
    {
        var command = new LinkEntityToIncidentCommand
        {
            IncidentId = id,
            EntityType = request.EntityType,
            EntityId = request.EntityId,
            EntityName = request.EntityName,
            Role = request.Role
        };

        var result = await _mediator.Send(command);
        if (result == null)
            return NotFound();

        return Ok(result);
    }

    [HttpPost("{id}/playbook")]
    public async Task<ActionResult<IncidentPlaybookRunDto>> RunPlaybook(Guid id, [FromBody] RunPlaybookRequest request)
    {
        var command = new RunPlaybookOnIncidentCommand
        {
            IncidentId = id,
            WorkflowId = request.WorkflowId,
            WorkflowName = request.WorkflowName,
            TriggeredByUserId = GetCurrentUserId(),
            Parameters = request.Parameters ?? new()
        };

        var result = await _mediator.Send(command);
        if (result == null)
            return NotFound();

        return Ok(result);
    }

    [HttpGet("{id}/timeline")]
    public async Task<ActionResult<List<IncidentTimelineItemDto>>> GetIncidentTimeline(
        Guid id,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int? limit)
    {
        var query = new GetIncidentTimelineQuery
        {
            IncidentId = id,
            From = from,
            To = to,
            Limit = limit
        };

        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}/related")]
    public async Task<ActionResult<List<IncidentDto>>> GetRelatedIncidents(
        Guid id,
        [FromQuery] int maxResults = 10,
        [FromQuery] bool includeSameUser = true,
        [FromQuery] bool includeSameApplication = true,
        [FromQuery] bool includeSameCategory = true)
    {
        var query = new GetRelatedIncidentsQuery
        {
            IncidentId = id,
            MaxResults = maxResults,
            IncludeSameUser = includeSameUser,
            IncludeSameApplication = includeSameApplication,
            IncludeSameCategory = includeSameCategory
        };

        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("statistics")]
    public async Task<ActionResult<IncidentStatisticsDto>> GetIncidentStatistics(
        [FromQuery] Guid tenantId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int trendDays = 30)
    {
        var query = new GetIncidentStatisticsQuery
        {
            TenantId = tenantId == Guid.Empty ? GetCurrentTenantId() : tenantId,
            From = from,
            To = to,
            TrendDays = trendDays
        };

        var result = await _mediator.Send(query);
        return Ok(result);
    }
}

public record CreateIncidentRequest(
    Guid TenantId,
    string Title,
    string Description,
    IncidentCategory Category,
    IncidentSeverity Severity,
    DetectionSource DetectionSource,
    Guid? PrimaryUserId,
    Guid? PrimaryAppId,
    int AffectedUsersCount,
    int AffectedAppsCount,
    List<IncidentEventDto>? InitialEvents,
    List<IncidentEntityDto>? RelatedEntities
);

public record UpdateIncidentRequest(
    string Title,
    string Description,
    IncidentCategory Category,
    IncidentSeverity Severity,
    int AffectedUsersCount,
    int AffectedAppsCount
);

public record AcknowledgeIncidentRequest(
    string? Note
);

public record AssignIncidentRequest(
    Guid AssignToUserId,
    string? Note
);

public record UpdateIncidentStatusRequest(
    IncidentStatus Status,
    string? Note
);

public record ResolveIncidentRequest(
    string ResolutionSummary
);

public record CloseIncidentRequest(
    string? FinalNote
);

public record AddIncidentNoteRequest(
    string Content
);

public record LinkEntityRequest(
    IncidentEntityType EntityType,
    string EntityId,
    string EntityName,
    IncidentEntityRole Role
);

public record RunPlaybookRequest(
    Guid WorkflowId,
    string WorkflowName,
    Dictionary<string, string>? Parameters
);
