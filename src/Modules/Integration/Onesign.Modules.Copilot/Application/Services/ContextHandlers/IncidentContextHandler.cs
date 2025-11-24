using Microsoft.Extensions.Logging;
using Onesign.Modules.Copilot.Application.DTOs;
using Onesign.Modules.Copilot.Domain.Enums;
using Onesign.Modules.Incidents.Application.Services;
using Onesign.Modules.Incidents.Domain.Repositories;
using Onesign.Modules.Automation.Domain.Repositories;

namespace Onesign.Modules.Copilot.Application.Services.ContextHandlers;

public class IncidentContextHandler : IContextHandler
{
    private readonly ILogger<IncidentContextHandler> _logger;
    private readonly IIncidentRepository _incidentRepository;
    private readonly IIncidentEventRepository _eventRepository;
    private readonly IIncidentPlaybookService _playbookService;
    private readonly IAutomationWorkflowRepository _workflowRepository;

    public IncidentContextHandler(
        ILogger<IncidentContextHandler> logger,
        IIncidentRepository incidentRepository,
        IIncidentEventRepository eventRepository,
        IIncidentPlaybookService playbookService,
        IAutomationWorkflowRepository workflowRepository)
    {
        _logger = logger;
        _incidentRepository = incidentRepository;
        _eventRepository = eventRepository;
        _playbookService = playbookService;
        _workflowRepository = workflowRepository;
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
            ["category"] = incidentData.Category,
            ["assignedTo"] = incidentData.AssignedTo,
            ["createdAt"] = incidentData.CreatedAt,
            ["events"] = incidentData.Events,
            ["entities"] = incidentData.Entities,
            ["availablePlaybooks"] = incidentData.AvailablePlaybooks,
            ["playbookRuns"] = incidentData.PlaybookRuns
        };
    }

    private async Task<IncidentContextData?> GetIncidentDataAsync(Guid tenantId, Guid incidentId, CancellationToken cancellationToken)
    {
        try
        {
            var incident = await _incidentRepository.GetByIdAsync(incidentId, cancellationToken);
            if (incident == null || incident.TenantId != tenantId)
            {
                _logger.LogWarning("Incident {IncidentId} not found for tenant {TenantId}", incidentId, tenantId);
                return null;
            }

            // Get related events
            var events = await _eventRepository.GetByIncidentAsync(incidentId, cancellationToken);
            var eventDtos = events.Select(e => new IncidentEventDto
            {
                EventId = e.Id,
                EventType = e.EventType,
                Description = e.EventType, // Use EventType as description since Description doesn't exist
                Timestamp = e.Timestamp
            }).Take(20).ToList();

            // Get playbook runs
            var playbookRuns = await _playbookService.GetPlaybookRunsForIncidentAsync(incidentId, cancellationToken);
            var playbookRunDtos = playbookRuns.Select(r => new PlaybookRunDto
            {
                RunId = r.Id,
                WorkflowName = r.WorkflowName,
                Status = r.Status.ToString(),
                StartedAt = r.StartedAt,
                CompletedAt = r.CompletedAt
            }).ToList();

            // Get available playbooks (automation workflows for incident response)
            var workflows = await _workflowRepository.GetByTenantIdAsync(tenantId, cancellationToken);
            var availablePlaybooks = workflows
                .Where(w => w.IsEnabled)
                .Select(w => new PlaybookDto
                {
                    PlaybookId = w.Id,
                    Name = w.Name,
                    Description = w.Description ?? string.Empty
                }).ToList();

            // Build entities from incident
            var entities = new List<IncidentEntityDto>();
            if (incident.PrimaryUserId.HasValue)
            {
                entities.Add(new IncidentEntityDto
                {
                    EntityType = "User",
                    EntityId = incident.PrimaryUserId.Value,
                    EntityName = "User", // Display name would need to be fetched separately
                    Role = "Primary"
                });
            }
            if (incident.PrimaryAppId.HasValue)
            {
                entities.Add(new IncidentEntityDto
                {
                    EntityType = "Application",
                    EntityId = incident.PrimaryAppId.Value,
                    EntityName = "Application", // Display name would need to be fetched separately
                    Role = "Primary"
                });
            }

            return new IncidentContextData
            {
                IncidentId = incident.Id,
                Title = incident.Title,
                Severity = incident.Severity.ToString(),
                Status = incident.Status.ToString(),
                Description = incident.Description ?? string.Empty,
                Category = incident.Category.ToString(),
                AssignedTo = incident.AssignedTo?.ToString() ?? null,
                CreatedAt = incident.CreatedAt,
                Events = eventDtos,
                Entities = entities,
                AvailablePlaybooks = availablePlaybooks,
                PlaybookRuns = playbookRunDtos.Cast<object>().ToList()
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get incident data for {IncidentId}", incidentId);
            return null;
        }
    }
}

public class PlaybookRunDto
{
    public Guid RunId { get; set; }
    public string WorkflowName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset StartedAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
}
