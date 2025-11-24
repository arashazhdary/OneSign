using Microsoft.Extensions.Logging;
using Onesign.Modules.Copilot.Application.DTOs;
using Onesign.Modules.Copilot.Domain.Enums;
using Onesign.Modules.Hunting.Domain.Repositories;
using Onesign.Modules.Hunting.Domain.Entities;

namespace Onesign.Modules.Copilot.Application.Services.ContextHandlers;

public class HuntingContextHandler : IContextHandler
{
    private readonly ILogger<HuntingContextHandler> _logger;
    private readonly ISavedQueryRepository _savedQueryRepository;
    private readonly IScheduledHuntRepository _scheduledHuntRepository;
    private readonly IHuntRunRepository _huntRunRepository;

    public HuntingContextHandler(
        ILogger<HuntingContextHandler> logger,
        ISavedQueryRepository savedQueryRepository,
        IScheduledHuntRepository scheduledHuntRepository,
        IHuntRunRepository huntRunRepository)
    {
        _logger = logger;
        _savedQueryRepository = savedQueryRepository;
        _scheduledHuntRepository = scheduledHuntRepository;
        _huntRunRepository = huntRunRepository;
    }

    public ContextType SupportedContextType => ContextType.Hunting;

    public async Task<Dictionary<string, object?>> GetContextDataAsync(Guid tenantId, Guid? contextId, CancellationToken cancellationToken = default)
    {
        _logger.LogDebug("Building hunting context for tenant {TenantId}, contextId {ContextId}", tenantId, contextId);

        var huntingData = await GetHuntingDataAsync(tenantId, contextId, cancellationToken);

        return new Dictionary<string, object?>
        {
            ["savedQueries"] = huntingData.SavedQueries,
            ["scheduledHunts"] = huntingData.ScheduledHunts,
            ["recentRuns"] = huntingData.RecentRuns,
            ["currentResults"] = huntingData.CurrentResults
        };
    }

    private async Task<HuntingContextData> GetHuntingDataAsync(Guid tenantId, Guid? contextId, CancellationToken cancellationToken)
    {
        try
        {
            // Get saved queries for the tenant
            var savedQueries = await _savedQueryRepository.GetByScopeAsync("Tenant", tenantId, cancellationToken);
            var savedQueryDtos = savedQueries?.Select(q => new SavedQueryDto
            {
                QueryId = q.Id,
                Name = q.Name,
                Query = q.QueryDslJson,
                Description = q.Description ?? string.Empty
            }).Take(20).ToList() ?? new List<SavedQueryDto>();

            // Get scheduled hunts
            var tenantScheduledHunts = await _scheduledHuntRepository.GetByScopeAsync("Tenant", tenantId, cancellationToken);
            var scheduledHuntDtos = tenantScheduledHunts?.Select(h =>
            {
                var lastRun = h.HuntRuns?.OrderByDescending(r => r.StartedAt).FirstOrDefault();
                return new ScheduledHuntDto
                {
                    HuntId = h.Id,
                    Name = h.Name,
                    Schedule = h.ScheduleSpec.ToString(),
                    LastRun = lastRun?.StartedAt,
                    LastResultCount = lastRun?.MatchCount ?? 0
                };
            }).ToList() ?? new List<ScheduledHuntDto>();

            // Get recent hunt runs
            var allRuns = await _huntRunRepository.GetByScopeAsync("Tenant", tenantId, cancellationToken);
            var recentRuns = allRuns?.Take(10).ToList();
            var recentRunDtos = recentRuns?.Select(r => new HuntRunDto
            {
                RunId = r.Id,
                QueryName = r.ScheduledHunt?.SavedQuery?.Name ?? "Ad-hoc Query",
                Status = r.Status.ToString(),
                ResultCount = r.MatchCount,
                ExecutedAt = r.StartedAt
            }).ToList() ?? new List<HuntRunDto>();

            // If a specific query is selected, get its results
            HuntResultsDto? currentResults = null;
            if (contextId.HasValue)
            {
                var query = await _savedQueryRepository.GetByIdAsync(contextId.Value, cancellationToken);
                if (query != null)
                {
                    // Find latest run for this query's scheduled hunts
                    var queryScheduledHunts = await _scheduledHuntRepository.GetBySavedQueryIdAsync(contextId.Value, cancellationToken);
                    HuntRun? latestRun = null;
                    if (queryScheduledHunts?.Any() == true)
                    {
                        foreach (var hunt in queryScheduledHunts)
                        {
                            var run = await _huntRunRepository.GetLatestByScheduledHuntIdAsync(hunt.Id, cancellationToken);
                            if (run != null && (latestRun == null || run.StartedAt > latestRun.StartedAt))
                            {
                                latestRun = run;
                            }
                        }
                    }
                    currentResults = new HuntResultsDto
                    {
                        QueryId = query.Id,
                        QueryName = query.Name,
                        TotalResults = latestRun?.MatchCount ?? 0,
                        Items = new List<HuntResultItemDto>() // Results would be loaded separately
                    };
                }
            }

            return new HuntingContextData
            {
                SavedQueries = savedQueryDtos,
                ScheduledHunts = scheduledHuntDtos,
                RecentRuns = recentRunDtos.Cast<object>().ToList(),
                CurrentResults = currentResults
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get hunting data for tenant {TenantId}", tenantId);
            return new HuntingContextData
            {
                SavedQueries = new List<SavedQueryDto>(),
                ScheduledHunts = new List<ScheduledHuntDto>(),
                RecentRuns = new List<HuntRunDto>().Cast<object>().ToList(),
                CurrentResults = null
            };
        }
    }
}

public class HuntRunDto
{
    public Guid RunId { get; set; }
    public string QueryName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int ResultCount { get; set; }
    public DateTimeOffset ExecutedAt { get; set; }
}
