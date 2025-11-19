using System.Text.Json;
using MediatR;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Hunting.Application.Commands;
using Onesign.Modules.Hunting.Application.DTOs;
using Onesign.Modules.Hunting.Application.Services;
using Onesign.Modules.Hunting.Domain.Entities;
using Onesign.Modules.Hunting.Domain.Enums;
using Onesign.Modules.Hunting.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Hunting.Application.Handlers;

public class CreateSavedQueryCommandHandler : IRequestHandler<CreateSavedQueryCommand, Result<SavedQueryDto>>
{
    private readonly ISavedQueryRepository _repository;
    private readonly IOqlParser _parser;
    private readonly ILogger<CreateSavedQueryCommandHandler> _logger;

    public CreateSavedQueryCommandHandler(
        ISavedQueryRepository repository,
        IOqlParser parser,
        ILogger<CreateSavedQueryCommandHandler> logger)
    {
        _repository = repository;
        _parser = parser;
        _logger = logger;
    }

    public async Task<Result<SavedQueryDto>> Handle(CreateSavedQueryCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating saved query for scope {ScopeType}/{ScopeId}", request.ScopeType, request.ScopeId);

        var dataset = _parser.ParseDataset(request.Dataset);
        if (dataset == null)
            return Result.Failure<SavedQueryDto>("InvalidDataset", $"Invalid dataset: {request.Dataset}");

        var parseResult = _parser.Parse(request.QueryDslJson);
        if (parseResult.IsFailure)
            return Result.Failure<SavedQueryDto>("InvalidQuery", parseResult.ErrorMessage);

        var validationResult = _parser.ValidateQuery(parseResult.Value!);
        if (validationResult.IsFailure)
            return Result.Failure<SavedQueryDto>(validationResult.ErrorCode!, validationResult.ErrorMessage);

        var savedQuery = new SavedQuery
        {
            Id = Guid.NewGuid(),
            ScopeType = request.ScopeType,
            ScopeId = request.ScopeId,
            Name = request.Name,
            Description = request.Description,
            Dataset = dataset.Value,
            QueryDslJson = request.QueryDslJson,
            IsGlobalTemplate = request.IsGlobalTemplate,
            IsEnabled = request.IsEnabled,
            CreatedByUserId = request.UserId,
            CreatedAt = DateTimeOffset.UtcNow
        };

        await _repository.AddAsync(savedQuery, cancellationToken);

        _logger.LogInformation("Created saved query {QueryId}", savedQuery.Id);

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

public class UpdateSavedQueryCommandHandler : IRequestHandler<UpdateSavedQueryCommand, Result<SavedQueryDto>>
{
    private readonly ISavedQueryRepository _repository;
    private readonly IOqlParser _parser;
    private readonly ILogger<UpdateSavedQueryCommandHandler> _logger;

    public UpdateSavedQueryCommandHandler(
        ISavedQueryRepository repository,
        IOqlParser parser,
        ILogger<UpdateSavedQueryCommandHandler> logger)
    {
        _repository = repository;
        _parser = parser;
        _logger = logger;
    }

    public async Task<Result<SavedQueryDto>> Handle(UpdateSavedQueryCommand request, CancellationToken cancellationToken)
    {
        var savedQuery = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (savedQuery == null || savedQuery.ScopeType != request.ScopeType || savedQuery.ScopeId != request.ScopeId)
            return Result.Failure<SavedQueryDto>("NotFound", "Saved query not found");

        var dataset = _parser.ParseDataset(request.Dataset);
        if (dataset == null)
            return Result.Failure<SavedQueryDto>("InvalidDataset", $"Invalid dataset: {request.Dataset}");

        var parseResult = _parser.Parse(request.QueryDslJson);
        if (parseResult.IsFailure)
            return Result.Failure<SavedQueryDto>("InvalidQuery", parseResult.ErrorMessage);

        var validationResult = _parser.ValidateQuery(parseResult.Value!);
        if (validationResult.IsFailure)
            return Result.Failure<SavedQueryDto>(validationResult.ErrorCode!, validationResult.ErrorMessage);

        savedQuery.Name = request.Name;
        savedQuery.Description = request.Description;
        savedQuery.Dataset = dataset.Value;
        savedQuery.QueryDslJson = request.QueryDslJson;
        savedQuery.IsGlobalTemplate = request.IsGlobalTemplate;
        savedQuery.IsEnabled = request.IsEnabled;
        savedQuery.UpdatedByUserId = request.UserId;
        savedQuery.UpdatedAt = DateTimeOffset.UtcNow;

        await _repository.UpdateAsync(savedQuery, cancellationToken);

        _logger.LogInformation("Updated saved query {QueryId}", savedQuery.Id);

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

public class DeleteSavedQueryCommandHandler : IRequestHandler<DeleteSavedQueryCommand, Result>
{
    private readonly ISavedQueryRepository _repository;
    private readonly ILogger<DeleteSavedQueryCommandHandler> _logger;

    public DeleteSavedQueryCommandHandler(ISavedQueryRepository repository, ILogger<DeleteSavedQueryCommandHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<Result> Handle(DeleteSavedQueryCommand request, CancellationToken cancellationToken)
    {
        var savedQuery = await _repository.GetByIdWithScheduledHuntsAsync(request.Id, cancellationToken);
        if (savedQuery == null || savedQuery.ScopeType != request.ScopeType || savedQuery.ScopeId != request.ScopeId)
            return Result.Failure("NotFound", "Saved query not found");

        if (savedQuery.ScheduledHunts.Count > 0)
            return Result.Failure("HasDependencies", $"Cannot delete query with {savedQuery.ScheduledHunts.Count} scheduled hunts");

        await _repository.DeleteAsync(request.Id, cancellationToken);

        _logger.LogInformation("Deleted saved query {QueryId}", request.Id);

        return Result.Success();
    }
}

public class CreateScheduledHuntCommandHandler : IRequestHandler<CreateScheduledHuntCommand, Result<ScheduledHuntDto>>
{
    private readonly IScheduledHuntRepository _scheduledHuntRepository;
    private readonly ISavedQueryRepository _savedQueryRepository;
    private readonly ILogger<CreateScheduledHuntCommandHandler> _logger;

    public CreateScheduledHuntCommandHandler(
        IScheduledHuntRepository scheduledHuntRepository,
        ISavedQueryRepository savedQueryRepository,
        ILogger<CreateScheduledHuntCommandHandler> logger)
    {
        _scheduledHuntRepository = scheduledHuntRepository;
        _savedQueryRepository = savedQueryRepository;
        _logger = logger;
    }

    public async Task<Result<ScheduledHuntDto>> Handle(CreateScheduledHuntCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating scheduled hunt for scope {ScopeType}/{ScopeId}", request.ScopeType, request.ScopeId);

        if (!Enum.TryParse<HuntScheduleSpec>(request.ScheduleSpec, true, out var scheduleSpec))
            return Result.Failure<ScheduledHuntDto>("InvalidScheduleSpec", $"Invalid schedule spec: {request.ScheduleSpec}");

        var savedQuery = await _savedQueryRepository.GetByIdAsync(request.SavedQueryId, cancellationToken);
        if (savedQuery == null)
            return Result.Failure<ScheduledHuntDto>("SavedQueryNotFound", "Saved query not found");

        var scheduledHunt = new ScheduledHunt
        {
            Id = Guid.NewGuid(),
            ScopeType = request.ScopeType,
            ScopeId = request.ScopeId,
            SavedQueryId = request.SavedQueryId,
            Name = request.Name,
            Description = request.Description,
            ScheduleSpec = scheduleSpec,
            IsEnabled = request.IsEnabled,
            MinMatchCountForFinding = request.MinMatchCountForFinding,
            MaxRowsToScan = request.MaxRowsToScan,
            TimeWindowMinutes = request.TimeWindowMinutes,
            ActionsJson = request.Actions != null ? JsonSerializer.Serialize(request.Actions) : null,
            CreatedByUserId = request.UserId,
            CreatedAt = DateTimeOffset.UtcNow
        };

        await _scheduledHuntRepository.AddAsync(scheduledHunt, cancellationToken);

        scheduledHunt.SavedQuery = savedQuery;

        _logger.LogInformation("Created scheduled hunt {HuntId}", scheduledHunt.Id);

        return Result.Success(MapToDto(scheduledHunt));
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

public class UpdateScheduledHuntCommandHandler : IRequestHandler<UpdateScheduledHuntCommand, Result<ScheduledHuntDto>>
{
    private readonly IScheduledHuntRepository _scheduledHuntRepository;
    private readonly ISavedQueryRepository _savedQueryRepository;
    private readonly ILogger<UpdateScheduledHuntCommandHandler> _logger;

    public UpdateScheduledHuntCommandHandler(
        IScheduledHuntRepository scheduledHuntRepository,
        ISavedQueryRepository savedQueryRepository,
        ILogger<UpdateScheduledHuntCommandHandler> logger)
    {
        _scheduledHuntRepository = scheduledHuntRepository;
        _savedQueryRepository = savedQueryRepository;
        _logger = logger;
    }

    public async Task<Result<ScheduledHuntDto>> Handle(UpdateScheduledHuntCommand request, CancellationToken cancellationToken)
    {
        var scheduledHunt = await _scheduledHuntRepository.GetByIdAsync(request.Id, cancellationToken);
        if (scheduledHunt == null || scheduledHunt.ScopeType != request.ScopeType || scheduledHunt.ScopeId != request.ScopeId)
            return Result.Failure<ScheduledHuntDto>("NotFound", "Scheduled hunt not found");

        if (!Enum.TryParse<HuntScheduleSpec>(request.ScheduleSpec, true, out var scheduleSpec))
            return Result.Failure<ScheduledHuntDto>("InvalidScheduleSpec", $"Invalid schedule spec: {request.ScheduleSpec}");

        var savedQuery = await _savedQueryRepository.GetByIdAsync(request.SavedQueryId, cancellationToken);
        if (savedQuery == null)
            return Result.Failure<ScheduledHuntDto>("SavedQueryNotFound", "Saved query not found");

        scheduledHunt.SavedQueryId = request.SavedQueryId;
        scheduledHunt.Name = request.Name;
        scheduledHunt.Description = request.Description;
        scheduledHunt.ScheduleSpec = scheduleSpec;
        scheduledHunt.IsEnabled = request.IsEnabled;
        scheduledHunt.MinMatchCountForFinding = request.MinMatchCountForFinding;
        scheduledHunt.MaxRowsToScan = request.MaxRowsToScan;
        scheduledHunt.TimeWindowMinutes = request.TimeWindowMinutes;
        scheduledHunt.ActionsJson = request.Actions != null ? JsonSerializer.Serialize(request.Actions) : null;
        scheduledHunt.UpdatedByUserId = request.UserId;
        scheduledHunt.UpdatedAt = DateTimeOffset.UtcNow;

        await _scheduledHuntRepository.UpdateAsync(scheduledHunt, cancellationToken);

        scheduledHunt.SavedQuery = savedQuery;

        _logger.LogInformation("Updated scheduled hunt {HuntId}", scheduledHunt.Id);

        return Result.Success(MapToDto(scheduledHunt));
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

public class DeleteScheduledHuntCommandHandler : IRequestHandler<DeleteScheduledHuntCommand, Result>
{
    private readonly IScheduledHuntRepository _repository;
    private readonly ILogger<DeleteScheduledHuntCommandHandler> _logger;

    public DeleteScheduledHuntCommandHandler(IScheduledHuntRepository repository, ILogger<DeleteScheduledHuntCommandHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<Result> Handle(DeleteScheduledHuntCommand request, CancellationToken cancellationToken)
    {
        var scheduledHunt = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (scheduledHunt == null || scheduledHunt.ScopeType != request.ScopeType || scheduledHunt.ScopeId != request.ScopeId)
            return Result.Failure("NotFound", "Scheduled hunt not found");

        await _repository.DeleteAsync(request.Id, cancellationToken);

        _logger.LogInformation("Deleted scheduled hunt {HuntId}", request.Id);

        return Result.Success();
    }
}

public class ExecuteHuntCommandHandler : IRequestHandler<ExecuteHuntCommand, Result<HuntRunDto>>
{
    private readonly IScheduledHuntRepository _scheduledHuntRepository;
    private readonly IScheduledHuntRunner _huntRunner;
    private readonly ILogger<ExecuteHuntCommandHandler> _logger;

    public ExecuteHuntCommandHandler(
        IScheduledHuntRepository scheduledHuntRepository,
        IScheduledHuntRunner huntRunner,
        ILogger<ExecuteHuntCommandHandler> logger)
    {
        _scheduledHuntRepository = scheduledHuntRepository;
        _huntRunner = huntRunner;
        _logger = logger;
    }

    public async Task<Result<HuntRunDto>> Handle(ExecuteHuntCommand request, CancellationToken cancellationToken)
    {
        var scheduledHunt = await _scheduledHuntRepository.GetByIdWithDetailsAsync(request.ScheduledHuntId, cancellationToken);
        if (scheduledHunt == null || scheduledHunt.ScopeType != request.ScopeType || scheduledHunt.ScopeId != request.ScopeId)
            return Result.Failure<HuntRunDto>("NotFound", "Scheduled hunt not found");

        _logger.LogInformation("Manually executing hunt {HuntId} ({HuntName})", scheduledHunt.Id, scheduledHunt.Name);

        var huntRun = await _huntRunner.RunHuntAsync(scheduledHunt, cancellationToken);

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
