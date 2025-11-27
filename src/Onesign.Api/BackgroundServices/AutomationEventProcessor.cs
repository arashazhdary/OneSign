using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Automation.Domain.Services;

namespace Onesign.Api.BackgroundServices;

/// <summary>
/// Background service that processes automation events from the notification outbox
/// and triggers workflows based on event subscriptions.
/// </summary>
public class AutomationEventProcessor : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<AutomationEventProcessor> _logger;

    public AutomationEventProcessor(
        IServiceProvider serviceProvider,
        ILogger<AutomationEventProcessor> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("AutomationEventProcessor started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessPendingEventsAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing automation events");
            }

            await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
        }

        _logger.LogInformation("AutomationEventProcessor stopped");
    }

    private async Task ProcessPendingEventsAsync(CancellationToken stoppingToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<Onesign.Data.Contexts.OnesignDbContext>();
        var workflowRepository = scope.ServiceProvider.GetRequiredService<Onesign.Modules.Automation.Domain.Repositories.IAutomationWorkflowRepository>();
        var executionRepository = scope.ServiceProvider.GetRequiredService<Onesign.Modules.Automation.Domain.Repositories.IAutomationExecutionRepository>();
        var actionExecutor = scope.ServiceProvider.GetRequiredService<Onesign.Modules.Automation.Domain.Services.IActionExecutor>();

        // Query for pending automation executions (Status = 0 = Pending)
        var pendingExecutions = await dbContext.AutomationExecutions
            .Where(e => e.Status == 0)
            .OrderBy(e => e.StartedAt)
            .Take(50) // Process up to 50 pending executions per batch
            .ToListAsync(stoppingToken);

        if (!pendingExecutions.Any())
        {
            return;
        }

        _logger.LogInformation("Processing {Count} pending automation executions", pendingExecutions.Count);

        foreach (var executionEntity in pendingExecutions)
        {
            if (stoppingToken.IsCancellationRequested)
                break;

            try
            {
                await ProcessExecutionAsync(executionEntity, workflowRepository, executionRepository, actionExecutor, stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing automation execution {ExecutionId}", executionEntity.Id);

                // Mark execution as failed
                executionEntity.Status = 3; // Failed
                executionEntity.ErrorMessage = ex.Message;
                executionEntity.CompletedAt = DateTimeOffset.UtcNow;
                await dbContext.SaveChangesAsync(stoppingToken);
            }
        }

        _logger.LogInformation("Completed processing pending automation executions at {Time}", DateTime.UtcNow);
    }

    private async Task ProcessExecutionAsync(
        Onesign.Modules.Automation.Infrastructure.EfCore.Entities.AutomationExecutionEntity executionEntity,
        Onesign.Modules.Automation.Domain.Repositories.IAutomationWorkflowRepository workflowRepository,
        Onesign.Modules.Automation.Domain.Repositories.IAutomationExecutionRepository executionRepository,
        Onesign.Modules.Automation.Domain.Services.IActionExecutor actionExecutor,
        CancellationToken cancellationToken)
    {
        _logger.LogDebug("Processing execution {ExecutionId} for workflow {WorkflowId}", executionEntity.Id, executionEntity.WorkflowId);

        // Update status to Running
        executionEntity.Status = 1; // Running
        await executionRepository.UpdateAsync(new Onesign.Modules.Automation.Domain.Entities.AutomationExecution
        {
            Id = executionEntity.Id,
            WorkflowId = executionEntity.WorkflowId,
            TenantId = executionEntity.TenantId,
            EventType = executionEntity.EventType,
            EventId = executionEntity.EventId,
            StartedAt = executionEntity.StartedAt,
            CompletedAt = executionEntity.CompletedAt,
            Status = Onesign.Modules.Automation.Domain.Enums.ExecutionStatus.Running,
            ErrorMessage = executionEntity.ErrorMessage,
            ActionsExecutedCount = executionEntity.ActionsExecutedCount,
            ActionsFailedCount = executionEntity.ActionsFailedCount,
            PayloadSnapshot = executionEntity.PayloadSnapshot
        }, cancellationToken);

        // Get workflow with full details (including actions)
        var workflow = await workflowRepository.GetByIdWithDetailsAsync(executionEntity.WorkflowId, cancellationToken);

        if (workflow == null)
        {
            _logger.LogWarning("Workflow {WorkflowId} not found for execution {ExecutionId}", executionEntity.WorkflowId, executionEntity.Id);

            executionEntity.Status = 3; // Failed
            executionEntity.ErrorMessage = "Workflow not found";
            executionEntity.CompletedAt = DateTimeOffset.UtcNow;
            await executionRepository.UpdateAsync(MapToDomainExecution(executionEntity), cancellationToken);
            return;
        }

        if (!workflow.IsEnabled)
        {
            _logger.LogInformation("Workflow {WorkflowId} is disabled, skipping execution {ExecutionId}", workflow.Id, executionEntity.Id);

            executionEntity.Status = 4; // Skipped
            executionEntity.ErrorMessage = "Workflow is disabled";
            executionEntity.CompletedAt = DateTimeOffset.UtcNow;
            await executionRepository.UpdateAsync(MapToDomainExecution(executionEntity), cancellationToken);
            return;
        }

        // Deserialize payload
        Dictionary<string, object?> payload;
        try
        {
            payload = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object?>>(executionEntity.PayloadSnapshot)
                ?? new Dictionary<string, object?>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to deserialize payload for execution {ExecutionId}", executionEntity.Id);

            executionEntity.Status = 3; // Failed
            executionEntity.ErrorMessage = "Failed to deserialize payload: " + ex.Message;
            executionEntity.CompletedAt = DateTimeOffset.UtcNow;
            await executionRepository.UpdateAsync(MapToDomainExecution(executionEntity), cancellationToken);
            return;
        }

        // Execute actions
        var actionsExecuted = 0;
        var actionsFailed = 0;
        string? errorMessage = null;

        foreach (var action in workflow.Actions.OrderBy(a => a.Order))
        {
            try
            {
                var result = await actionExecutor.ExecuteAsync(action, executionEntity.TenantId, payload, cancellationToken);

                if (result.IsSuccess)
                {
                    actionsExecuted++;
                    _logger.LogDebug("Action {ActionType} succeeded for execution {ExecutionId}", action.ActionType, executionEntity.Id);
                }
                else
                {
                    actionsFailed++;
                    _logger.LogWarning("Action {ActionType} failed for execution {ExecutionId}: {Error}",
                        action.ActionType, executionEntity.Id, result.ErrorMessage);

                    if (action.IsCritical)
                    {
                        errorMessage = $"Critical action {action.ActionType} failed: {result.ErrorMessage}";
                        break;
                    }
                }
            }
            catch (Exception ex)
            {
                actionsFailed++;
                _logger.LogError(ex, "Exception executing action {ActionType} for execution {ExecutionId}", action.ActionType, executionEntity.Id);

                if (action.IsCritical)
                {
                    errorMessage = $"Critical action {action.ActionType} threw exception: {ex.Message}";
                    break;
                }
            }
        }

        // Update execution with results
        executionEntity.Status = actionsFailed > 0 && !string.IsNullOrEmpty(errorMessage) ? 3 : 2; // Failed : Succeeded
        executionEntity.CompletedAt = DateTimeOffset.UtcNow;
        executionEntity.ActionsExecutedCount = actionsExecuted;
        executionEntity.ActionsFailedCount = actionsFailed;
        executionEntity.ErrorMessage = errorMessage;

        await executionRepository.UpdateAsync(MapToDomainExecution(executionEntity), cancellationToken);

        _logger.LogInformation("Completed execution {ExecutionId} with status {Status}",
            executionEntity.Id,
            executionEntity.Status == 2 ? "Succeeded" : "Failed");
    }

    private static Onesign.Modules.Automation.Domain.Entities.AutomationExecution MapToDomainExecution(
        Onesign.Modules.Automation.Infrastructure.EfCore.Entities.AutomationExecutionEntity entity)
    {
        return new Onesign.Modules.Automation.Domain.Entities.AutomationExecution
        {
            Id = entity.Id,
            WorkflowId = entity.WorkflowId,
            TenantId = entity.TenantId,
            EventType = entity.EventType,
            EventId = entity.EventId,
            StartedAt = entity.StartedAt,
            CompletedAt = entity.CompletedAt,
            Status = (Onesign.Modules.Automation.Domain.Enums.ExecutionStatus)entity.Status,
            ErrorMessage = entity.ErrorMessage,
            ActionsExecutedCount = entity.ActionsExecutedCount,
            ActionsFailedCount = entity.ActionsFailedCount,
            PayloadSnapshot = entity.PayloadSnapshot
        };
    }

    /// <summary>
    /// Public method to trigger automation for a specific event.
    /// Can be called from other services or controllers.
    /// </summary>
    public async Task TriggerAutomationAsync(string eventType, object payload, string? eventId = null)
    {
        using var scope = _serviceProvider.CreateScope();
        var automationEngine = scope.ServiceProvider.GetRequiredService<IAutomationEngine>();

        await automationEngine.HandleEventAsync(eventType, payload, eventId);
    }
}

/// <summary>
/// Extension methods for automation event triggering.
/// </summary>
public static class AutomationExtensions
{
    /// <summary>
    /// Triggers automation workflows for the given event.
    /// This can be called from any service after a significant event occurs.
    /// </summary>
    public static async Task TriggerAutomationAsync(
        this IServiceProvider serviceProvider,
        string eventType,
        object payload,
        string? eventId = null,
        CancellationToken cancellationToken = default)
    {
        using var scope = serviceProvider.CreateScope();
        var automationEngine = scope.ServiceProvider.GetRequiredService<IAutomationEngine>();
        await automationEngine.HandleEventAsync(eventType, payload, eventId, cancellationToken);
    }
}
