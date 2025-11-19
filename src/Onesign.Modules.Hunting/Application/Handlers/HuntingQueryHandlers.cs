using System.Text.Json;
using MediatR;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Hunting.Application.DTOs;
using Onesign.Modules.Hunting.Application.Queries;
using Onesign.Modules.Hunting.Application.Services;
using Onesign.Modules.Hunting.Domain.Entities;
using Onesign.Modules.Hunting.Domain.Enums;
using Onesign.Modules.Hunting.Domain.Repositories;
using Onesign.Shared.Pagination;
using Onesign.Shared.Result;

namespace Onesign.Modules.Hunting.Application.Handlers;

public class ExecuteOqlQueryHandler : IRequestHandler<ExecuteOqlQuery, Result<HuntResultDto>>
{
    private readonly IOqlExecutor _executor;
    private readonly ILogger<ExecuteOqlQueryHandler> _logger;

    public ExecuteOqlQueryHandler(IOqlExecutor executor, ILogger<ExecuteOqlQueryHandler> logger)
    {
        _executor = executor;
        _logger = logger;
    }

    public async Task<Result<HuntResultDto>> Handle(ExecuteOqlQuery request, CancellationToken cancellationToken)
    {
        _logger.LogDebug("Executing OQL query for scope {ScopeType}/{ScopeId}", request.ScopeType, request.ScopeId);

        return await _executor.ExecuteAsync(request.ScopeType, request.ScopeId, request.Query, cancellationToken);
    }
}

public class GetSavedQueriesQueryHandler : IRequestHandler<GetSavedQueriesQuery, Result<PagedResult<SavedQueryDto>>>
{
    private readonly ISavedQueryRepository _repository;
    private readonly IOqlParser _parser;
    private readonly ILogger<GetSavedQueriesQueryHandler> _logger;

    public GetSavedQueriesQueryHandler(
        ISavedQueryRepository repository,
        IOqlParser parser,
        ILogger<GetSavedQueriesQueryHandler> logger)
    {
        _repository = repository;
        _parser = parser;
        _logger = logger;
    }

    public async Task<Result<PagedResult<SavedQueryDto>>> Handle(GetSavedQueriesQuery request, CancellationToken cancellationToken)
    {
        _logger.LogDebug("Fetching saved queries for scope {ScopeType}/{ScopeId}", request.ScopeType, request.ScopeId);

        HuntDataset? dataset = null;
        if (!string.IsNullOrEmpty(request.Dataset))
        {
            dataset = _parser.ParseDataset(request.Dataset);
        }

        var (items, totalCount) = await _repository.GetPagedAsync(
            request.ScopeType,
            request.ScopeId,
            dataset,
            request.IsEnabled,
            request.SearchTerm,
            request.PageNumber,
            request.PageSize,
            cancellationToken);

        var result = new PagedResult<SavedQueryDto>
        {
            Items = items.Select(MapToDto).ToList(),
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };

        return Result.Success(result);
    }

    private static SavedQueryDto MapToDto(SavedQuery q) => new()
    {
        Id = q.Id,
        ScopeType = q.ScopeType,
        ScopeId = q.ScopeId,
        Name = q.Name,
        Description = q.Description,
        Dataset = q.Dataset.ToString(),
        QueryDslJson = q.QueryDslJson,
        IsGlobalTemplate = q.IsGlobalTemplate,
        IsEnabled = q.IsEnabled,
        CreatedByUserId = q.CreatedByUserId,
        CreatedAt = q.CreatedAt,
        UpdatedByUserId = q.UpdatedByUserId,
        UpdatedAt = q.UpdatedAt,
        ScheduledHuntsCount = q.ScheduledHunts.Count
    };
}

public class GetSavedQueryDetailQueryHandler : IRequestHandler<GetSavedQueryDetailQuery, Result<SavedQueryDto>>
{
    private readonly ISavedQueryRepository _repository;
    private readonly ILogger<GetSavedQueryDetailQueryHandler> _logger;

    public GetSavedQueryDetailQueryHandler(ISavedQueryRepository repository, ILogger<GetSavedQueryDetailQueryHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<Result<SavedQueryDto>> Handle(GetSavedQueryDetailQuery request, CancellationToken cancellationToken)
    {
        var savedQuery = await _repository.GetByIdWithScheduledHuntsAsync(request.Id, cancellationToken);
        if (savedQuery == null || savedQuery.ScopeType != request.ScopeType || savedQuery.ScopeId != request.ScopeId)
            return Result.Failure<SavedQueryDto>("NotFound", "Saved query not found");

        return Result.Success(MapToDto(savedQuery));
    }

    private static SavedQueryDto MapToDto(SavedQuery q) => new()
    {
        Id = q.Id,
        ScopeType = q.ScopeType,
        ScopeId = q.ScopeId,
        Name = q.Name,
        Description = q.Description,
        Dataset = q.Dataset.ToString(),
        QueryDslJson = q.QueryDslJson,
        IsGlobalTemplate = q.IsGlobalTemplate,
        IsEnabled = q.IsEnabled,
        CreatedByUserId = q.CreatedByUserId,
        CreatedAt = q.CreatedAt,
        UpdatedByUserId = q.UpdatedByUserId,
        UpdatedAt = q.UpdatedAt,
        ScheduledHuntsCount = q.ScheduledHunts.Count
    };
}

public class GetScheduledHuntsQueryHandler : IRequestHandler<GetScheduledHuntsQuery, Result<PagedResult<ScheduledHuntDto>>>
{
    private readonly IScheduledHuntRepository _scheduledHuntRepository;
    private readonly IHuntRunRepository _huntRunRepository;
    private readonly ILogger<GetScheduledHuntsQueryHandler> _logger;

    public GetScheduledHuntsQueryHandler(
        IScheduledHuntRepository scheduledHuntRepository,
        IHuntRunRepository huntRunRepository,
        ILogger<GetScheduledHuntsQueryHandler> logger)
    {
        _scheduledHuntRepository = scheduledHuntRepository;
        _huntRunRepository = huntRunRepository;
        _logger = logger;
    }

    public async Task<Result<PagedResult<ScheduledHuntDto>>> Handle(GetScheduledHuntsQuery request, CancellationToken cancellationToken)
    {
        _logger.LogDebug("Fetching scheduled hunts for scope {ScopeType}/{ScopeId}", request.ScopeType, request.ScopeId);

        HuntScheduleSpec? scheduleSpec = null;
        if (!string.IsNullOrEmpty(request.ScheduleSpec) && Enum.TryParse<HuntScheduleSpec>(request.ScheduleSpec, true, out var parsedSpec))
        {
            scheduleSpec = parsedSpec;
        }

        var (items, totalCount) = await _scheduledHuntRepository.GetPagedAsync(
            request.ScopeType,
            request.ScopeId,
            scheduleSpec,
            request.IsEnabled,
            request.SavedQueryId,
            request.PageNumber,
            request.PageSize,
            cancellationToken);

        var dtos = new List<ScheduledHuntDto>();
        foreach (var hunt in items)
        {
            var dto = MapToDto(hunt);

            // Get last run info
            var lastRun = await _huntRunRepository.GetLatestByScheduledHuntIdAsync(hunt.Id, cancellationToken);
            if (lastRun != null)
            {
                dto.LastRunAt = lastRun.StartedAt;
                dto.LastRunStatus = lastRun.Status.ToString();
            }

            dtos.Add(dto);
        }

        var result = new PagedResult<ScheduledHuntDto>
        {
            Items = dtos,
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };

        return Result.Success(result);
    }

    private static ScheduledHuntDto MapToDto(ScheduledHunt h)
    {
        HuntActionConfigDto? actions = null;
        if (!string.IsNullOrWhiteSpace(h.ActionsJson))
        {
            try
            {
                actions = JsonSerializer.Deserialize<HuntActionConfigDto>(h.ActionsJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            }
            catch { }
        }

        return new ScheduledHuntDto
        {
            Id = h.Id,
            ScopeType = h.ScopeType,
            ScopeId = h.ScopeId,
            SavedQueryId = h.SavedQueryId,
            SavedQueryName = h.SavedQuery?.Name ?? string.Empty,
            Name = h.Name,
            Description = h.Description,
            ScheduleSpec = h.ScheduleSpec.ToString(),
            IsEnabled = h.IsEnabled,
            MinMatchCountForFinding = h.MinMatchCountForFinding,
            MaxRowsToScan = h.MaxRowsToScan,
            TimeWindowMinutes = h.TimeWindowMinutes,
            Actions = actions,
            CreatedByUserId = h.CreatedByUserId,
            CreatedAt = h.CreatedAt,
            UpdatedByUserId = h.UpdatedByUserId,
            UpdatedAt = h.UpdatedAt,
            HuntRunsCount = h.HuntRuns.Count
        };
    }
}

public class GetHuntRunsQueryHandler : IRequestHandler<GetHuntRunsQuery, Result<PagedResult<HuntRunDto>>>
{
    private readonly IHuntRunRepository _repository;
    private readonly ILogger<GetHuntRunsQueryHandler> _logger;

    public GetHuntRunsQueryHandler(IHuntRunRepository repository, ILogger<GetHuntRunsQueryHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<Result<PagedResult<HuntRunDto>>> Handle(GetHuntRunsQuery request, CancellationToken cancellationToken)
    {
        _logger.LogDebug("Fetching hunt runs for scope {ScopeType}/{ScopeId}", request.ScopeType, request.ScopeId);

        HuntRunStatus? status = null;
        if (!string.IsNullOrEmpty(request.Status) && Enum.TryParse<HuntRunStatus>(request.Status, true, out var parsedStatus))
        {
            status = parsedStatus;
        }

        var (items, totalCount) = await _repository.GetPagedAsync(
            request.ScopeType,
            request.ScopeId,
            request.ScheduledHuntId,
            status,
            request.FromDate,
            request.ToDate,
            request.PageNumber,
            request.PageSize,
            cancellationToken);

        var result = new PagedResult<HuntRunDto>
        {
            Items = items.Select(MapToDto).ToList(),
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };

        return Result.Success(result);
    }

    private static HuntRunDto MapToDto(HuntRun r) => new()
    {
        Id = r.Id,
        ScheduledHuntId = r.ScheduledHuntId,
        ScheduledHuntName = r.ScheduledHunt?.Name ?? string.Empty,
        ScopeType = r.ScopeType,
        ScopeId = r.ScopeId,
        StartedAt = r.StartedAt,
        CompletedAt = r.CompletedAt,
        Status = r.Status.ToString(),
        MatchCount = r.MatchCount,
        FindingCreated = r.FindingCreated,
        IncidentId = r.IncidentId,
        TriggeredWorkflowId = r.TriggeredWorkflowId,
        ErrorMessage = r.ErrorMessage,
        SampleRows = r.SampleRows.Select(s => new HuntSampleRowDto
        {
            Id = s.Id,
            RowIndex = s.RowIndex,
            Dataset = s.Dataset.ToString(),
            DocumentJson = s.DocumentJson
        }).ToList()
    };
}

public class GetHuntRunDetailQueryHandler : IRequestHandler<GetHuntRunDetailQuery, Result<HuntRunDto>>
{
    private readonly IHuntRunRepository _repository;
    private readonly ILogger<GetHuntRunDetailQueryHandler> _logger;

    public GetHuntRunDetailQueryHandler(IHuntRunRepository repository, ILogger<GetHuntRunDetailQueryHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<Result<HuntRunDto>> Handle(GetHuntRunDetailQuery request, CancellationToken cancellationToken)
    {
        var huntRun = await _repository.GetByIdWithSampleRowsAsync(request.Id, cancellationToken);
        if (huntRun == null || huntRun.ScopeType != request.ScopeType || huntRun.ScopeId != request.ScopeId)
            return Result.Failure<HuntRunDto>("NotFound", "Hunt run not found");

        return Result.Success(MapToDto(huntRun));
    }

    private static HuntRunDto MapToDto(HuntRun r) => new()
    {
        Id = r.Id,
        ScheduledHuntId = r.ScheduledHuntId,
        ScheduledHuntName = r.ScheduledHunt?.Name ?? string.Empty,
        ScopeType = r.ScopeType,
        ScopeId = r.ScopeId,
        StartedAt = r.StartedAt,
        CompletedAt = r.CompletedAt,
        Status = r.Status.ToString(),
        MatchCount = r.MatchCount,
        FindingCreated = r.FindingCreated,
        IncidentId = r.IncidentId,
        TriggeredWorkflowId = r.TriggeredWorkflowId,
        ErrorMessage = r.ErrorMessage,
        SampleRows = r.SampleRows.Select(s => new HuntSampleRowDto
        {
            Id = s.Id,
            RowIndex = s.RowIndex,
            Dataset = s.Dataset.ToString(),
            DocumentJson = s.DocumentJson
        }).ToList()
    };
}
