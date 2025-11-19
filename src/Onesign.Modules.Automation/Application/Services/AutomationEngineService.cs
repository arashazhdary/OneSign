using System.Text.Json;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Automation.Domain.Entities;
using Onesign.Modules.Automation.Domain.Enums;
using Onesign.Modules.Automation.Domain.Repositories;
using Onesign.Modules.Automation.Domain.Services;

namespace Onesign.Modules.Automation.Application.Services;

public class AutomationEngineService : IAutomationEngine
{
    private readonly IAutomationWorkflowRepository _workflowRepository;
    private readonly IAutomationExecutionRepository _executionRepository;
    private readonly IConditionEvaluator _conditionEvaluator;
    private readonly IActionExecutor _actionExecutor;
    private readonly ILogger<AutomationEngineService> _logger;

    public AutomationEngineService(
        IAutomationWorkflowRepository workflowRepository,
        IAutomationExecutionRepository executionRepository,
        IConditionEvaluator conditionEvaluator,
        IActionExecutor actionExecutor,
        ILogger<AutomationEngineService> logger)
    {
        _workflowRepository = workflowRepository;
        _executionRepository = executionRepository;
        _conditionEvaluator = conditionEvaluator;
        _actionExecutor = actionExecutor;
        _logger = logger;
    }

    public async Task HandleEventAsync(string eventType, object payload, string? eventId = null, CancellationToken cancellationToken = default)
    {
        var payloadDict = ConvertToPayloadDictionary(payload);

        if (!payloadDict.TryGetValue("tenantId", out var tenantIdObj) || tenantIdObj == null)
        {
            _logger.LogWarning("Event {EventType} does not have a TenantId, skipping automation", eventType);
            return;
        }

        if (!Guid.TryParse(tenantIdObj.ToString(), out var tenantId))
        {
            _logger.LogWarning("Invalid TenantId in event {EventType}, skipping automation", eventType);
            return;
        }

        payloadDict["eventType"] = eventType;

        var workflows = await _workflowRepository.GetByEventTypeAsync(tenantId, eventType, cancellationToken);

        if (!workflows.Any())
        {
            _logger.LogDebug("No workflows found for event {EventType} in tenant {TenantId}", eventType, tenantId);
            return;
        }

        _logger.LogInformation("Found {Count} workflows for event {EventType} in tenant {TenantId}", workflows.Count, eventType, tenantId);

        foreach (var workflow in workflows)
        {
            await ExecuteWorkflowAsync(workflow, tenantId, eventType, eventId, payloadDict, cancellationToken);
        }
    }

    private async Task ExecuteWorkflowAsync(
        AutomationWorkflow workflow,
        Guid tenantId,
        string eventType,
        string? eventId,
        Dictionary<string, object?> payload,
        CancellationToken cancellationToken)
    {
        if (!string.IsNullOrEmpty(eventId))
        {
            var exists = await _executionRepository.ExistsAsync(workflow.Id, eventId, cancellationToken);
            if (exists)
            {
                _logger.LogDebug("Workflow {WorkflowId} already executed for event {EventId}, skipping", workflow.Id, eventId);
                return;
            }
        }

        if (workflow.Conditions.Any())
        {
            foreach (var condition in workflow.Conditions.OrderBy(c => c.Order))
            {
                var conditionResult = _conditionEvaluator.Evaluate(condition.ExpressionType, condition.Expression, payload);
                if (!conditionResult)
                {
                    _logger.LogDebug("Workflow {WorkflowId} condition not met, skipping", workflow.Id);
                    return;
                }
            }
        }

        var execution = new AutomationExecution
        {
            Id = Guid.NewGuid(),
            WorkflowId = workflow.Id,
            TenantId = tenantId,
            EventType = eventType,
            EventId = eventId,
            StartedAt = DateTimeOffset.UtcNow,
            Status = ExecutionStatus.Running,
            PayloadSnapshot = SanitizeAndSerializePayload(payload)
        };

        await _executionRepository.AddAsync(execution, cancellationToken);

        _logger.LogInformation("Started execution {ExecutionId} of workflow {WorkflowName} for event {EventType}",
            execution.Id, workflow.Name, eventType);

        var actionsExecuted = 0;
        var actionsFailed = 0;
        string? errorMessage = null;

        try
        {
            foreach (var action in workflow.Actions.OrderBy(a => a.Order))
            {
                var result = await _actionExecutor.ExecuteAsync(action, tenantId, payload, cancellationToken);

                if (result.IsSuccess)
                {
                    actionsExecuted++;
                    _logger.LogDebug("Action {ActionType} succeeded for execution {ExecutionId}", action.ActionType, execution.Id);
                }
                else
                {
                    actionsFailed++;
                    _logger.LogWarning("Action {ActionType} failed for execution {ExecutionId}: {Error}",
                        action.ActionType, execution.Id, result.ErrorMessage);

                    if (action.IsCritical)
                    {
                        errorMessage = $"Critical action {action.ActionType} failed: {result.ErrorMessage}";
                        break;
                    }
                }
            }

            execution.Status = actionsFailed > 0 && !string.IsNullOrEmpty(errorMessage)
                ? ExecutionStatus.Failed
                : ExecutionStatus.Succeeded;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception during workflow {WorkflowId} execution", workflow.Id);
            execution.Status = ExecutionStatus.Failed;
            errorMessage = ex.Message;
        }

        execution.CompletedAt = DateTimeOffset.UtcNow;
        execution.ActionsExecutedCount = actionsExecuted;
        execution.ActionsFailedCount = actionsFailed;
        execution.ErrorMessage = errorMessage;

        await _executionRepository.UpdateAsync(execution, cancellationToken);

        _logger.LogInformation("Completed execution {ExecutionId} of workflow {WorkflowName} with status {Status}",
            execution.Id, workflow.Name, execution.Status);
    }

    private static Dictionary<string, object?> ConvertToPayloadDictionary(object payload)
    {
        if (payload is Dictionary<string, object?> dict)
            return dict;

        if (payload is JsonElement jsonElement)
        {
            return JsonElementToDictionary(jsonElement);
        }

        var json = JsonSerializer.Serialize(payload);
        var element = JsonDocument.Parse(json).RootElement;
        return JsonElementToDictionary(element);
    }

    private static Dictionary<string, object?> JsonElementToDictionary(JsonElement element)
    {
        var dict = new Dictionary<string, object?>();

        if (element.ValueKind != JsonValueKind.Object)
            return dict;

        foreach (var property in element.EnumerateObject())
        {
            dict[property.Name] = property.Value.ValueKind switch
            {
                JsonValueKind.String => property.Value.GetString(),
                JsonValueKind.Number => property.Value.GetDecimal(),
                JsonValueKind.True => true,
                JsonValueKind.False => false,
                JsonValueKind.Null => null,
                JsonValueKind.Object => JsonElementToDictionary(property.Value),
                JsonValueKind.Array => property.Value.EnumerateArray()
                    .Select(e => e.ValueKind switch
                    {
                        JsonValueKind.String => (object?)e.GetString(),
                        JsonValueKind.Number => e.GetDecimal(),
                        _ => e.ToString()
                    }).ToList(),
                _ => property.Value.ToString()
            };
        }

        return dict;
    }

    private static string SanitizeAndSerializePayload(Dictionary<string, object?> payload)
    {
        var sanitized = new Dictionary<string, object?>();
        var sensitiveKeys = new[] { "password", "secret", "token", "key", "ssn", "creditCard", "email", "phone", "address" };

        foreach (var kvp in payload)
        {
            if (sensitiveKeys.Any(k => kvp.Key.Contains(k, StringComparison.OrdinalIgnoreCase)))
            {
                sanitized[kvp.Key] = "[REDACTED]";
            }
            else if (kvp.Value is Dictionary<string, object?> nested)
            {
                sanitized[kvp.Key] = SanitizeNestedPayload(nested, sensitiveKeys);
            }
            else
            {
                sanitized[kvp.Key] = kvp.Value;
            }
        }

        return JsonSerializer.Serialize(sanitized);
    }

    private static Dictionary<string, object?> SanitizeNestedPayload(Dictionary<string, object?> payload, string[] sensitiveKeys)
    {
        var sanitized = new Dictionary<string, object?>();

        foreach (var kvp in payload)
        {
            if (sensitiveKeys.Any(k => kvp.Key.Contains(k, StringComparison.OrdinalIgnoreCase)))
            {
                sanitized[kvp.Key] = "[REDACTED]";
            }
            else
            {
                sanitized[kvp.Key] = kvp.Value;
            }
        }

        return sanitized;
    }
}
