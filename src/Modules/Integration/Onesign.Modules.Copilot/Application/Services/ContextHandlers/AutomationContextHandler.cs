using Microsoft.Extensions.Logging;
using Onesign.Modules.Copilot.Application.DTOs;
using Onesign.Modules.Copilot.Domain.Enums;
using Onesign.Modules.Automation.Domain.Repositories;

namespace Onesign.Modules.Copilot.Application.Services.ContextHandlers;

public class AutomationContextHandler : IContextHandler
{
    private readonly ILogger<AutomationContextHandler> _logger;
    private readonly IAutomationWorkflowRepository _workflowRepository;
    private readonly IAutomationExecutionRepository _executionRepository;

    public AutomationContextHandler(
        ILogger<AutomationContextHandler> logger,
        IAutomationWorkflowRepository workflowRepository,
        IAutomationExecutionRepository executionRepository)
    {
        _logger = logger;
        _workflowRepository = workflowRepository;
        _executionRepository = executionRepository;
    }

    public ContextType SupportedContextType => ContextType.Automation;

    public async Task<Dictionary<string, object?>> GetContextDataAsync(Guid tenantId, Guid? contextId, CancellationToken cancellationToken = default)
    {
        _logger.LogDebug("Building automation context for tenant {TenantId}, contextId {ContextId}", tenantId, contextId);

        var automationData = await GetAutomationDataAsync(tenantId, contextId, cancellationToken);

        return new Dictionary<string, object?>
        {
            ["workflows"] = automationData.Workflows,
            ["recentExecutions"] = automationData.RecentExecutions,
            ["selectedWorkflow"] = automationData.SelectedWorkflow,
            ["executionStats"] = automationData.ExecutionStats
        };
    }

    private async Task<AutomationContextData> GetAutomationDataAsync(Guid tenantId, Guid? contextId, CancellationToken cancellationToken)
    {
        try
        {
            // Get all workflows for the tenant
            var workflows = await _workflowRepository.GetByTenantIdAsync(tenantId, cancellationToken);
            var workflowDtos = workflows.Select(w => new WorkflowSummaryDto
            {
                WorkflowId = w.Id,
                Name = w.Name,
                IsEnabled = w.IsEnabled,
                Severity = w.Severity.ToString(),
                TriggerCount = w.Triggers?.Count ?? 0,
                ActionCount = w.Actions?.Count ?? 0
            }).ToList();

            // Get recent executions
            var recentExecutions = await _executionRepository.GetByTenantIdAsync(tenantId, null, null, null, null, 1, 20, cancellationToken);
            var executionDtos = recentExecutions?.Select(e => new RecentExecutionDto
            {
                ExecutionId = e.Id,
                WorkflowName = e.WorkflowName ?? "Unknown",
                Status = e.Status.ToString(),
                ExecutedAt = e.StartedAt
            }).ToList() ?? new List<RecentExecutionDto>();

            // If a specific workflow is selected, get its details
            WorkflowDetailDto? selectedWorkflow = null;
            if (contextId.HasValue)
            {
                var workflow = await _workflowRepository.GetByIdWithDetailsAsync(contextId.Value, cancellationToken);
                if (workflow != null && workflow.TenantId == tenantId)
                {
                    var workflowExecutions = await _executionRepository.GetByTenantIdAsync(tenantId, contextId.Value, null, null, null, 1, 10, cancellationToken);

                    selectedWorkflow = new WorkflowDetailDto
                    {
                        WorkflowId = workflow.Id,
                        Name = workflow.Name,
                        Description = workflow.Description ?? string.Empty,
                        IsEnabled = workflow.IsEnabled,
                        Severity = workflow.Severity.ToString(),
                        Triggers = workflow.Triggers?.Select(t => new TriggerSummaryDto
                        {
                            TriggerId = t.Id,
                            TriggerType = t.SourceModule,
                            EventType = t.EventType
                        }).ToList() ?? new List<TriggerSummaryDto>(),
                        Actions = workflow.Actions?.Select(a => new ActionSummaryDto
                        {
                            ActionId = a.Id,
                            ActionType = a.ActionType.ToString(),
                            Order = a.Order
                        }).ToList() ?? new List<ActionSummaryDto>(),
                        RecentExecutions = workflowExecutions?.Select(e => new RecentExecutionDto
                        {
                            ExecutionId = e.Id,
                            WorkflowName = workflow.Name,
                            Status = e.Status.ToString(),
                            ExecutedAt = e.StartedAt
                        }).ToList() ?? new List<RecentExecutionDto>()
                    };
                }
            }

            // Calculate execution statistics
            var stats = new ExecutionStatsDto
            {
                TotalWorkflows = workflowDtos.Count,
                EnabledWorkflows = workflowDtos.Count(w => w.IsEnabled),
                TotalExecutionsLast24h = executionDtos.Count(e => e.ExecutedAt > DateTimeOffset.UtcNow.AddHours(-24)),
                SuccessRate = CalculateSuccessRate(recentExecutions)
            };

            return new AutomationContextData
            {
                Workflows = workflowDtos,
                RecentExecutions = executionDtos,
                SelectedWorkflow = selectedWorkflow,
                ExecutionStats = stats
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get automation data for tenant {TenantId}", tenantId);
            return new AutomationContextData
            {
                Workflows = new List<WorkflowSummaryDto>(),
                RecentExecutions = new List<RecentExecutionDto>()
            };
        }
    }

    private static decimal CalculateSuccessRate(IReadOnlyList<Modules.Automation.Domain.Entities.AutomationExecution>? executions)
    {
        if (executions == null || executions.Count == 0)
            return 100m;

        var successCount = executions.Count(e => e.Status.ToString() == "Completed");
        return (decimal)successCount / executions.Count * 100;
    }
}

public class WorkflowDetailDto
{
    public Guid WorkflowId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsEnabled { get; set; }
    public string Severity { get; set; } = string.Empty;
    public List<TriggerSummaryDto> Triggers { get; set; } = new();
    public List<ActionSummaryDto> Actions { get; set; } = new();
    public List<RecentExecutionDto> RecentExecutions { get; set; } = new();
}

public class TriggerSummaryDto
{
    public Guid TriggerId { get; set; }
    public string TriggerType { get; set; } = string.Empty;
    public string EventType { get; set; } = string.Empty;
}

public class ActionSummaryDto
{
    public Guid ActionId { get; set; }
    public string ActionType { get; set; } = string.Empty;
    public int Order { get; set; }
}

public class ExecutionStatsDto
{
    public int TotalWorkflows { get; set; }
    public int EnabledWorkflows { get; set; }
    public int TotalExecutionsLast24h { get; set; }
    public decimal SuccessRate { get; set; }
}
