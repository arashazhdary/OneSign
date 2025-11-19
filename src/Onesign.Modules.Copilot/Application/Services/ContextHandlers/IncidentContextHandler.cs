using Microsoft.Extensions.Logging;
using Onesign.Modules.Copilot.Application.DTOs;
using Onesign.Modules.Copilot.Domain.Enums;

namespace Onesign.Modules.Copilot.Application.Services.ContextHandlers;

public class IncidentContextHandler : IContextHandler
{
    private readonly ILogger<IncidentContextHandler> _logger;

    public IncidentContextHandler(ILogger<IncidentContextHandler> logger)
    {
        _logger = logger;
    }

    public ContextType SupportedContextType => ContextType.Incident;

    public async Task<Dictionary<string, object?>> GetContextDataAsync(Guid tenantId, Guid? contextId, CancellationToken cancellationToken = default)
    {
        if (!contextId.HasValue)
        {
            _logger.LogWarning("Incident context requested without incident ID for tenant {TenantId}", tenantId);
            return new Dictionary<string, object?>();
        }

        _logger.LogDebug("Building incident context for tenant {TenantId}, incident {IncidentId}", tenantId, contextId.Value);

        var incidentData = await GetIncidentDataAsync(tenantId, contextId.Value, cancellationToken);
        if (incidentData == null)
        {
            return new Dictionary<string, object?>();
        }

        return new Dictionary<string, object?>
        {
            ["incidentId"] = incidentData.IncidentId,
            ["title"] = incidentData.Title,
            ["severity"] = incidentData.Severity,
            ["status"] = incidentData.Status,
            ["description"] = incidentData.Description,
            ["events"] = incidentData.Events,
            ["entities"] = incidentData.Entities,
            ["availablePlaybooks"] = incidentData.AvailablePlaybooks
        };
    }

    private Task<IncidentContextData?> GetIncidentDataAsync(Guid tenantId, Guid incidentId, CancellationToken cancellationToken)
    {
        // Integration with Incidents module would go here
        // This would fetch incident details, related events, entities, and available playbooks
        var data = new IncidentContextData
        {
            IncidentId = incidentId,
            Title = string.Empty,
            Severity = "Medium",
            Status = "Open",
            Description = string.Empty,
            Events = new List<IncidentEventDto>(),
            Entities = new List<IncidentEntityDto>(),
            AvailablePlaybooks = new List<PlaybookDto>()
        };

        return Task.FromResult<IncidentContextData?>(data);
    }
}
