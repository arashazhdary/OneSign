using Microsoft.Extensions.Logging;
using Onesign.Modules.Copilot.Application.DTOs;
using Onesign.Modules.Copilot.Domain.Enums;

namespace Onesign.Modules.Copilot.Application.Services.ContextHandlers;

public class HuntingContextHandler : IContextHandler
{
    private readonly ILogger<HuntingContextHandler> _logger;

    public HuntingContextHandler(ILogger<HuntingContextHandler> logger)
    {
        _logger = logger;
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
            ["currentResults"] = huntingData.CurrentResults
        };
    }

    private Task<HuntingContextData> GetHuntingDataAsync(Guid tenantId, Guid? contextId, CancellationToken cancellationToken)
    {
        // Integration with Hunting/Insights module would go here
        var data = new HuntingContextData
        {
            SavedQueries = new List<SavedQueryDto>(),
            ScheduledHunts = new List<ScheduledHuntDto>(),
            CurrentResults = contextId.HasValue ? new HuntResultsDto
            {
                QueryId = contextId.Value,
                QueryName = string.Empty,
                TotalResults = 0,
                Items = new List<HuntResultItemDto>()
            } : null
        };

        return Task.FromResult(data);
    }
}
