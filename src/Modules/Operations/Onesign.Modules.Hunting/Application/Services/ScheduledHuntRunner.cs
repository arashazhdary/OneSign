using System.Text.Json;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Hunting.Application.DTOs;
using Onesign.Modules.Hunting.Domain.Entities;
using Onesign.Modules.Hunting.Domain.Enums;
using Onesign.Modules.Hunting.Domain.Repositories;

namespace Onesign.Modules.Hunting.Application.Services;

public class ScheduledHuntRunner : IScheduledHuntRunner
{
    private readonly IScheduledHuntRepository _scheduledHuntRepository;
    private readonly ISavedQueryRepository _savedQueryRepository;
    private readonly IHuntRunRepository _huntRunRepository;
    private readonly IOqlParser _oqlParser;
    private readonly IOqlExecutor _oqlExecutor;
    private readonly IHuntActionExecutor _actionExecutor;
    private readonly ILogger<ScheduledHuntRunner> _logger;

    public ScheduledHuntRunner(
        IScheduledHuntRepository scheduledHuntRepository,
        ISavedQueryRepository savedQueryRepository,
        IHuntRunRepository huntRunRepository,
        IOqlParser oqlParser,
        IOqlExecutor oqlExecutor,
        IHuntActionExecutor actionExecutor,
        ILogger<ScheduledHuntRunner> logger)
    {
        _scheduledHuntRepository = scheduledHuntRepository;
        _savedQueryRepository = savedQueryRepository;
        _huntRunRepository = huntRunRepository;
        _oqlParser = oqlParser;
        _oqlExecutor = oqlExecutor;
        _actionExecutor = actionExecutor;
        _logger = logger;
    }

    public async Task RunScheduledHuntsAsync(HuntScheduleSpec scheduleSpec, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Starting scheduled hunt run for schedule spec {ScheduleSpec}", scheduleSpec);

        var hunts = await _scheduledHuntRepository.GetEnabledByScheduleSpecAsync(scheduleSpec, cancellationToken);

        _logger.LogInformation("Found {Count} enabled hunts for schedule spec {ScheduleSpec}", hunts.Count, scheduleSpec);

        foreach (var hunt in hunts)
        {
            if (cancellationToken.IsCancellationRequested)
                break;

            try
            {
                await RunHuntAsync(hunt, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to run scheduled hunt {HuntId} ({HuntName})", hunt.Id, hunt.Name);
            }
        }

        _logger.LogInformation("Completed scheduled hunt run for schedule spec {ScheduleSpec}", scheduleSpec);
    }

    public async Task<HuntRun> RunHuntAsync(ScheduledHunt scheduledHunt, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Running hunt {HuntId} ({HuntName})", scheduledHunt.Id, scheduledHunt.Name);

        var huntRun = new HuntRun
        {
            Id = Guid.NewGuid(),
            ScheduledHuntId = scheduledHunt.Id,
            ScopeType = scheduledHunt.ScopeType,
            ScopeId = scheduledHunt.ScopeId,
            StartedAt = DateTimeOffset.UtcNow,
            Status = HuntRunStatus.Running
        };

        await _huntRunRepository.AddAsync(huntRun, cancellationToken);

        try
        {
            var savedQuery = scheduledHunt.SavedQuery ?? await _savedQueryRepository.GetByIdAsync(scheduledHunt.SavedQueryId, cancellationToken);
            if (savedQuery == null)
            {
                throw new InvalidOperationException($"Saved query {scheduledHunt.SavedQueryId} not found");
            }

            var parseResult = _oqlParser.Parse(savedQuery.QueryDslJson);
            if (parseResult.IsFailure)
            {
                throw new InvalidOperationException($"Failed to parse query: {parseResult.ErrorMessage}");
            }

            var query = parseResult.Value!;

            // Apply time window from scheduled hunt
            query.TimeRange = new OqlTimeRangeDto
            {
                Start = DateTimeOffset.UtcNow.AddMinutes(-scheduledHunt.TimeWindowMinutes),
                End = DateTimeOffset.UtcNow
            };

            // Apply max rows limit
            query.Limit = scheduledHunt.MaxRowsToScan;

            var result = await _oqlExecutor.ExecuteAsync(
                scheduledHunt.ScopeType,
                scheduledHunt.ScopeId,
                query,
                cancellationToken);

            if (result.IsFailure)
            {
                throw new InvalidOperationException($"Query execution failed: {result.ErrorMessage}");
            }

            huntRun.MatchCount = result.Value!.Rows.Count;
            huntRun.CompletedAt = DateTimeOffset.UtcNow;
            huntRun.Status = HuntRunStatus.Succeeded;

            // Store sample rows
            var sampleCount = Math.Min(100, result.Value.Rows.Count);
            for (int i = 0; i < sampleCount; i++)
            {
                huntRun.SampleRows.Add(new HuntSampleRow
                {
                    Id = Guid.NewGuid(),
                    HuntRunId = huntRun.Id,
                    RowIndex = i,
                    Dataset = savedQuery.Dataset,
                    DocumentJson = result.Value.Rows[i].GetRawText()
                });
            }

            // Execute actions if threshold met
            if (huntRun.MatchCount >= scheduledHunt.MinMatchCountForFinding)
            {
                var actionsConfig = ParseActionsConfig(scheduledHunt.ActionsJson);
                if (actionsConfig != null)
                {
                    var actionResult = await _actionExecutor.ExecuteActionsAsync(
                        huntRun,
                        scheduledHunt,
                        actionsConfig,
                        cancellationToken);

                    huntRun.FindingCreated = actionResult.FindingCreated;
                    huntRun.IncidentId = actionResult.IncidentId;
                    huntRun.TriggeredWorkflowId = actionResult.TriggeredWorkflowId;
                }
            }

            await _huntRunRepository.UpdateAsync(huntRun, cancellationToken);

            _logger.LogInformation(
                "Hunt {HuntId} completed successfully. Found {MatchCount} matches",
                scheduledHunt.Id, huntRun.MatchCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Hunt {HuntId} failed", scheduledHunt.Id);

            huntRun.Status = HuntRunStatus.Failed;
            huntRun.CompletedAt = DateTimeOffset.UtcNow;
            huntRun.ErrorMessage = ex.Message;

            await _huntRunRepository.UpdateAsync(huntRun, cancellationToken);
        }

        return huntRun;
    }

    private HuntActionConfigDto? ParseActionsConfig(string? actionsJson)
    {
        if (string.IsNullOrWhiteSpace(actionsJson))
            return null;

        try
        {
            return JsonSerializer.Deserialize<HuntActionConfigDto>(actionsJson, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "Failed to parse hunt actions config");
            return null;
        }
    }
}
