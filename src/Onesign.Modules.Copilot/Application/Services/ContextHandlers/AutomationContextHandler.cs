using Microsoft.Extensions.Logging;
using Onesign.Modules.Copilot.Application.DTOs;
using Onesign.Modules.Copilot.Domain.Enums;

namespace Onesign.Modules.Copilot.Application.Services.ContextHandlers;

public class AutomationContextHandler : IContextHandler
{
    private readonly ILogger<AutomationContextHandler> _logger;

    public AutomationContextHandler(ILogger<AutomationContextHandler> logger)
    {
        _logger = logger;
    }

    public ContextType SupportedContextType => ContextType.Automation;

    public async Task<Dictionary<string, object?>> GetContextDataAsync(Guid tenantId, Guid? contextId, CancellationToken cancellationToken = default)
    {
        _logger.LogDebug("Building automation context for tenant {TenantId}, contextId {ContextId}", tenantId, contextId);

        var automationData = await GetAutomationDataAsync(tenantId, contextId, cancellationToken);

        return new Dictionary<string, object?>
        {
            ["workflows"] = automationData.Workflows,
            ["recentExecutions"] = automationData.RecentExecutions
        };
    }

    private Task<AutomationContextData> GetAutomationDataAsync(Guid tenantId, Guid? contextId, CancellationToken cancellationToken)
    {
        // Integration with Automation module would go here
        var data = new AutomationContextData
        {
            Workflows = new List<WorkflowSummaryDto>(),
            RecentExecutions = new List<RecentExecutionDto>()
        };

        return Task.FromResult(data);
    }
}
