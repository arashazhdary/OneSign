using Microsoft.Extensions.Logging;
using Onesign.Modules.Copilot.Application.DTOs;
using Onesign.Modules.Copilot.Domain.Enums;

namespace Onesign.Modules.Copilot.Application.Services.ContextHandlers;

public class ChangeSetContextHandler : IContextHandler
{
    private readonly ILogger<ChangeSetContextHandler> _logger;

    public ChangeSetContextHandler(ILogger<ChangeSetContextHandler> logger)
    {
        _logger = logger;
    }

    public ContextType SupportedContextType => ContextType.ChangeSet;

    public async Task<Dictionary<string, object?>> GetContextDataAsync(Guid tenantId, Guid? contextId, CancellationToken cancellationToken = default)
    {
        if (!contextId.HasValue)
        {
            _logger.LogWarning("ChangeSet context requested without change set ID for tenant {TenantId}", tenantId);
            return new Dictionary<string, object?>();
        }

        _logger.LogDebug("Building change set context for tenant {TenantId}, changeSet {ChangeSetId}", tenantId, contextId.Value);

        var changeSetData = await GetChangeSetDataAsync(tenantId, contextId.Value, cancellationToken);
        if (changeSetData == null)
        {
            return new Dictionary<string, object?>();
        }

        return new Dictionary<string, object?>
        {
            ["changeSetId"] = changeSetData.ChangeSetId,
            ["name"] = changeSetData.Name,
            ["status"] = changeSetData.Status,
            ["description"] = changeSetData.Description,
            ["items"] = changeSetData.Items,
            ["simulationSummary"] = changeSetData.SimulationSummary
        };
    }

    private Task<ChangeSetContextData?> GetChangeSetDataAsync(Guid tenantId, Guid changeSetId, CancellationToken cancellationToken)
    {
        // Integration with ChangeManagement module would go here
        var data = new ChangeSetContextData
        {
            ChangeSetId = changeSetId,
            Name = string.Empty,
            Status = "Draft",
            Description = string.Empty,
            Items = new List<ChangeItemDto>(),
            SimulationSummary = null
        };

        return Task.FromResult<ChangeSetContextData?>(data);
    }
}
