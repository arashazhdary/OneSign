using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Incidents.Application.DTOs;
using Onesign.Modules.Incidents.Application.Queries;
using Onesign.Modules.Incidents.Application.Services;
using Onesign.Modules.Incidents.Domain.Entities;
using Onesign.Modules.Incidents.Domain.Enums;
using Onesign.Modules.Incidents.Domain.Repositories;
using Onesign.Modules.Incidents.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Incidents.Application.Handlers;

public class GetIncidentsQueryHandler : IRequestHandler<GetIncidentsQuery, IncidentListDto>
{
    private readonly IIncidentRepository _repository;
    private readonly ILogger<GetIncidentsQueryHandler> _logger;

    public GetIncidentsQueryHandler(
        IIncidentRepository repository,
        ILogger<GetIncidentsQueryHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<IncidentListDto> Handle(GetIncidentsQuery request, CancellationToken cancellationToken)
    {
        var skip = (request.Page - 1) * request.PageSize;
        var incidents = await _repository.GetByTenantAsync(request.TenantId, skip, request.PageSize, cancellationToken);
        var totalCount = await _repository.GetCountByTenantAsync(request.TenantId, cancellationToken);

        var filteredIncidents = incidents.AsEnumerable();

        if (request.Status.HasValue)
            filteredIncidents = filteredIncidents.Where(i => i.Status == request.Status.Value);

        if (request.Severity.HasValue)
            filteredIncidents = filteredIncidents.Where(i => i.Severity == request.Severity.Value);

        if (request.Category.HasValue)
            filteredIncidents = filteredIncidents.Where(i => i.Category == request.Category.Value);

        if (request.DetectionSource.HasValue)
            filteredIncidents = filteredIncidents.Where(i => i.DetectionSource == request.DetectionSource.Value);

        if (request.PrimaryUserId.HasValue)
            filteredIncidents = filteredIncidents.Where(i => i.PrimaryUserId == request.PrimaryUserId.Value);

        if (request.PrimaryAppId.HasValue)
            filteredIncidents = filteredIncidents.Where(i => i.PrimaryAppId == request.PrimaryAppId.Value);

        if (request.From.HasValue)
            filteredIncidents = filteredIncidents.Where(i => i.DetectedAt >= request.From.Value);

        if (request.To.HasValue)
            filteredIncidents = filteredIncidents.Where(i => i.DetectedAt <= request.To.Value);

        if (!string.IsNullOrEmpty(request.SearchTerm))
            filteredIncidents = filteredIncidents.Where(i =>
                i.Title.Contains(request.SearchTerm, StringComparison.OrdinalIgnoreCase) ||
                i.Description.Contains(request.SearchTerm, StringComparison.OrdinalIgnoreCase));

        var dtos = filteredIncidents.Select(MapToDto).ToList();

        return new IncidentListDto
        {
            Incidents = dtos,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }

    private static IncidentDto MapToDto(Incident incident) => new()
    {
        Id = incident.Id,
        TenantId = incident.TenantId,
        Title = incident.Title,
        Description = incident.Description,
        Category = incident.Category,
        Severity = incident.Severity,
        Status = incident.Status,
        DetectionSource = incident.DetectionSource,
        PrimaryUserId = incident.PrimaryUserId,
        PrimaryAppId = incident.PrimaryAppId,
        AffectedUsersCount = incident.AffectedUsersCount,
        AffectedAppsCount = incident.AffectedAppsCount,
        DetectedAt = incident.DetectedAt,
        AcknowledgedAt = incident.AcknowledgedAt,
        AcknowledgedByUserId = incident.AcknowledgedByUserId,
        ResolvedAt = incident.ResolvedAt,
        ResolvedByUserId = incident.ResolvedByUserId,
        ClosedAt = incident.ClosedAt,
        ClosedByUserId = incident.ClosedByUserId,
        ResolutionSummary = incident.ResolutionSummary,
        CreatedAt = incident.CreatedAt,
        UpdatedAt = incident.UpdatedAt
    };
}

public class GetIncidentDetailQueryHandler : IRequestHandler<GetIncidentDetailQuery, IncidentDetailDto?>
{
    private readonly IIncidentRepository _repository;
    private readonly IIncidentEventRepository _eventRepository;
    private readonly IIncidentNoteRepository _noteRepository;
    private readonly IIncidentTimelineService _timelineService;
    private readonly DbContext _dbContext;
    private readonly ILogger<GetIncidentDetailQueryHandler> _logger;

    public GetIncidentDetailQueryHandler(
        IIncidentRepository repository,
        IIncidentEventRepository eventRepository,
        IIncidentNoteRepository noteRepository,
        IIncidentTimelineService timelineService,
        DbContext dbContext,
        ILogger<GetIncidentDetailQueryHandler> logger)
    {
        _repository = repository;
        _eventRepository = eventRepository;
        _noteRepository = noteRepository;
        _timelineService = timelineService;
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<IncidentDetailDto?> Handle(GetIncidentDetailQuery request, CancellationToken cancellationToken)
    {
        var incident = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (incident == null)
        {
            _logger.LogWarning("Incident {IncidentId} not found", request.Id);
            return null;
        }

        var detail = new IncidentDetailDto
        {
            Id = incident.Id,
            TenantId = incident.TenantId,
            Title = incident.Title,
            Description = incident.Description,
            Category = incident.Category,
            Severity = incident.Severity,
            Status = incident.Status,
            DetectionSource = incident.DetectionSource,
            PrimaryUserId = incident.PrimaryUserId,
            PrimaryAppId = incident.PrimaryAppId,
            AffectedUsersCount = incident.AffectedUsersCount,
            AffectedAppsCount = incident.AffectedAppsCount,
            DetectedAt = incident.DetectedAt,
            AcknowledgedAt = incident.AcknowledgedAt,
            AcknowledgedByUserId = incident.AcknowledgedByUserId,
            ResolvedAt = incident.ResolvedAt,
            ResolvedByUserId = incident.ResolvedByUserId,
            ClosedAt = incident.ClosedAt,
            ClosedByUserId = incident.ClosedByUserId,
            ResolutionSummary = incident.ResolutionSummary,
            CreatedAt = incident.CreatedAt,
            UpdatedAt = incident.UpdatedAt
        };

        if (request.IncludeEvents)
        {
            var events = await _eventRepository.GetByIncidentAsync(request.Id, cancellationToken);
            detail.Events = events.Select(e => new IncidentEventDto
            {
                Id = e.Id,
                IncidentId = e.IncidentId,
                EventType = e.EventType,
                EventData = e.EventData,
                Timestamp = e.Timestamp,
                SourceModule = e.SourceModule
            }).ToList();
        }

        if (request.IncludeEntities)
        {
            var entities = await _dbContext.Set<IncidentLinkedEntity>()
                .Where(e => e.IncidentId == request.Id)
                .ToListAsync(cancellationToken);
            detail.Entities = entities.Select(e => new IncidentEntityDto
            {
                Id = e.Id,
                IncidentId = e.IncidentId,
                EntityType = (IncidentEntityType)e.EntityType,
                EntityId = e.EntityId,
                EntityName = e.EntityName,
                Role = (IncidentEntityRole)e.Role
            }).ToList();
        }

        if (request.IncludeNotes)
        {
            var notes = await _noteRepository.GetByIncidentAsync(request.Id, cancellationToken);
            detail.Notes = notes.Select(n => new IncidentNoteDto
            {
                Id = n.Id,
                IncidentId = n.IncidentId,
                Content = n.Content,
                CreatedByUserId = n.CreatedByUserId,
                CreatedAt = n.CreatedAt,
                UpdatedAt = n.UpdatedAt
            }).ToList();
        }

        if (request.IncludePlaybookRuns)
        {
            var runs = await _dbContext.Set<IncidentPlaybookRunEntity>()
                .Where(r => r.IncidentId == request.Id)
                .OrderByDescending(r => r.StartedAt)
                .ToListAsync(cancellationToken);
            detail.PlaybookRuns = runs.Select(r => new IncidentPlaybookRunDto
            {
                Id = r.Id,
                IncidentId = r.IncidentId,
                WorkflowId = r.WorkflowId,
                WorkflowName = r.WorkflowName,
                Status = r.Status,
                StartedAt = r.StartedAt,
                CompletedAt = r.CompletedAt,
                Result = r.Result
            }).ToList();
        }

        if (request.IncludeTimeline)
        {
            detail.Timeline = await _timelineService.BuildTimelineAsync(request.Id, cancellationToken);
        }

        return detail;
    }
}

public class GetIncidentTimelineQueryHandler : IRequestHandler<GetIncidentTimelineQuery, List<IncidentTimelineItemDto>>
{
    private readonly IIncidentTimelineService _timelineService;
    private readonly ILogger<GetIncidentTimelineQueryHandler> _logger;

    public GetIncidentTimelineQueryHandler(
        IIncidentTimelineService timelineService,
        ILogger<GetIncidentTimelineQueryHandler> logger)
    {
        _timelineService = timelineService;
        _logger = logger;
    }

    public async Task<List<IncidentTimelineItemDto>> Handle(GetIncidentTimelineQuery request, CancellationToken cancellationToken)
    {
        var timeline = await _timelineService.BuildTimelineAsync(request.IncidentId, cancellationToken);

        if (request.From.HasValue)
            timeline = timeline.Where(t => t.Timestamp >= request.From.Value).ToList();

        if (request.To.HasValue)
            timeline = timeline.Where(t => t.Timestamp <= request.To.Value).ToList();

        if (request.Limit.HasValue)
            timeline = timeline.Take(request.Limit.Value).ToList();

        return timeline;
    }
}

public class GetIncidentStatisticsQueryHandler : IRequestHandler<GetIncidentStatisticsQuery, IncidentStatisticsDto>
{
    private readonly IIncidentRepository _repository;
    private readonly ILogger<GetIncidentStatisticsQueryHandler> _logger;

    public GetIncidentStatisticsQueryHandler(
        IIncidentRepository repository,
        ILogger<GetIncidentStatisticsQueryHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<IncidentStatisticsDto> Handle(GetIncidentStatisticsQuery request, CancellationToken cancellationToken)
    {
        var from = request.From ?? DateTime.UtcNow.AddDays(-request.TrendDays);
        var to = request.To ?? DateTime.UtcNow;

        var incidents = await _repository.GetByDateRangeAsync(request.TenantId, from, to, cancellationToken);

        var stats = new IncidentStatisticsDto
        {
            TenantId = request.TenantId,
            TotalIncidents = incidents.Count,
            NewIncidents = incidents.Count(i => i.Status == IncidentStatus.New),
            AcknowledgedIncidents = incidents.Count(i => i.Status == IncidentStatus.Acknowledged),
            InvestigatingIncidents = incidents.Count(i => i.Status == IncidentStatus.Investigating),
            ContainmentIncidents = incidents.Count(i => i.Status == IncidentStatus.Containment),
            RemediationIncidents = incidents.Count(i => i.Status == IncidentStatus.Remediation),
            ResolvedIncidents = incidents.Count(i => i.Status == IncidentStatus.Resolved),
            ClosedIncidents = incidents.Count(i => i.Status == IncidentStatus.Closed),
            CriticalIncidents = incidents.Count(i => i.Severity == IncidentSeverity.Critical),
            HighIncidents = incidents.Count(i => i.Severity == IncidentSeverity.High),
            MediumIncidents = incidents.Count(i => i.Severity == IncidentSeverity.Medium),
            LowIncidents = incidents.Count(i => i.Severity == IncidentSeverity.Low),
            InformationalIncidents = incidents.Count(i => i.Severity == IncidentSeverity.Informational)
        };

        var acknowledgedIncidents = incidents.Where(i => i.AcknowledgedAt.HasValue).ToList();
        if (acknowledgedIncidents.Count > 0)
        {
            var avgAcknowledgeMinutes = acknowledgedIncidents
                .Average(i => (i.AcknowledgedAt!.Value - i.DetectedAt).TotalMinutes);
            stats.MeanTimeToAcknowledge = Math.Round((decimal)avgAcknowledgeMinutes, 2);
        }

        var resolvedIncidents = incidents.Where(i => i.ResolvedAt.HasValue).ToList();
        if (resolvedIncidents.Count > 0)
        {
            var avgResolveMinutes = resolvedIncidents
                .Average(i => (i.ResolvedAt!.Value - i.DetectedAt).TotalMinutes);
            stats.MeanTimeToResolve = Math.Round((decimal)avgResolveMinutes, 2);
        }

        var closedIncidents = incidents.Where(i => i.ClosedAt.HasValue).ToList();
        if (closedIncidents.Count > 0)
        {
            var avgCloseMinutes = closedIncidents
                .Average(i => (i.ClosedAt!.Value - i.DetectedAt).TotalMinutes);
            stats.MeanTimeToClose = Math.Round((decimal)avgCloseMinutes, 2);
        }

        stats.ByCategory = Enum.GetValues<IncidentCategory>()
            .Select(c => new IncidentCategoryStatDto
            {
                Category = c.ToString(),
                Count = incidents.Count(i => i.Category == c),
                Percentage = incidents.Count > 0
                    ? Math.Round((decimal)incidents.Count(i => i.Category == c) / incidents.Count * 100, 2)
                    : 0
            })
            .Where(c => c.Count > 0)
            .OrderByDescending(c => c.Count)
            .ToList();

        stats.DailyTrend = new List<IncidentTrendDto>();
        for (var date = DateOnly.FromDateTime(from); date <= DateOnly.FromDateTime(to); date = date.AddDays(1))
        {
            var dayStart = date.ToDateTime(TimeOnly.MinValue);
            var dayEnd = date.ToDateTime(TimeOnly.MaxValue);

            stats.DailyTrend.Add(new IncidentTrendDto
            {
                Date = date,
                Created = incidents.Count(i => i.DetectedAt >= dayStart && i.DetectedAt <= dayEnd),
                Resolved = incidents.Count(i => i.ResolvedAt.HasValue && i.ResolvedAt.Value >= dayStart && i.ResolvedAt.Value <= dayEnd),
                Closed = incidents.Count(i => i.ClosedAt.HasValue && i.ClosedAt.Value >= dayStart && i.ClosedAt.Value <= dayEnd)
            });
        }

        return stats;
    }
}

public class GetRelatedIncidentsQueryHandler : IRequestHandler<GetRelatedIncidentsQuery, List<IncidentDto>>
{
    private readonly IIncidentRepository _repository;
    private readonly IIncidentCorrelationService _correlationService;
    private readonly ILogger<GetRelatedIncidentsQueryHandler> _logger;

    public GetRelatedIncidentsQueryHandler(
        IIncidentRepository repository,
        IIncidentCorrelationService correlationService,
        ILogger<GetRelatedIncidentsQueryHandler> logger)
    {
        _repository = repository;
        _correlationService = correlationService;
        _logger = logger;
    }

    public async Task<List<IncidentDto>> Handle(GetRelatedIncidentsQuery request, CancellationToken cancellationToken)
    {
        var incident = await _repository.GetByIdAsync(request.IncidentId, cancellationToken);
        if (incident == null)
        {
            _logger.LogWarning("Incident {IncidentId} not found for finding related incidents", request.IncidentId);
            return new List<IncidentDto>();
        }

        var relatedIncidents = await _correlationService.FindRelatedIncidentsAsync(
            incident,
            request.TimeWindow,
            request.IncludeSameUser,
            request.IncludeSameApplication,
            request.IncludeSameCategory,
            cancellationToken);

        return relatedIncidents
            .Take(request.MaxResults)
            .Select(MapToDto)
            .ToList();
    }

    private static IncidentDto MapToDto(Incident incident) => new()
    {
        Id = incident.Id,
        TenantId = incident.TenantId,
        Title = incident.Title,
        Description = incident.Description,
        Category = incident.Category,
        Severity = incident.Severity,
        Status = incident.Status,
        DetectionSource = incident.DetectionSource,
        PrimaryUserId = incident.PrimaryUserId,
        PrimaryAppId = incident.PrimaryAppId,
        AffectedUsersCount = incident.AffectedUsersCount,
        AffectedAppsCount = incident.AffectedAppsCount,
        DetectedAt = incident.DetectedAt,
        AcknowledgedAt = incident.AcknowledgedAt,
        AcknowledgedByUserId = incident.AcknowledgedByUserId,
        ResolvedAt = incident.ResolvedAt,
        ResolvedByUserId = incident.ResolvedByUserId,
        ClosedAt = incident.ClosedAt,
        ClosedByUserId = incident.ClosedByUserId,
        ResolutionSummary = incident.ResolutionSummary,
        CreatedAt = incident.CreatedAt,
        UpdatedAt = incident.UpdatedAt
    };
}
