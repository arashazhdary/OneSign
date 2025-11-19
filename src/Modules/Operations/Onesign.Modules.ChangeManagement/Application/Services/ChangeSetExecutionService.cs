using System.Text.Json;
using Microsoft.Extensions.Logging;
using Onesign.Modules.ChangeManagement.Domain.Entities;
using Onesign.Modules.ChangeManagement.Domain.Enums;
using Onesign.Modules.ChangeManagement.Domain.Repositories;

namespace Onesign.Modules.ChangeManagement.Application.Services;

public class ChangeSetExecutionService : IChangeSetExecutionService
{
    private readonly IChangeSetRepository _changeSetRepository;
    private readonly IChangeExecutionLogRepository _executionLogRepository;
    private readonly ILogger<ChangeSetExecutionService> _logger;

    public ChangeSetExecutionService(
        IChangeSetRepository changeSetRepository,
        IChangeExecutionLogRepository executionLogRepository,
        ILogger<ChangeSetExecutionService> logger)
    {
        _changeSetRepository = changeSetRepository;
        _executionLogRepository = executionLogRepository;
        _logger = logger;
    }

    public async Task<bool> ApplyAsync(ChangeSet changeSet, Guid executedByUserId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Applying change set {ChangeSetId} with {ItemCount} items", changeSet.Id, changeSet.Items.Count);

        var allSucceeded = true;
        var appliedItems = new List<ChangeItem>();

        try
        {
            // Log start of apply
            await LogExecutionAsync(changeSet.Id, null, ExecutionStep.Apply, "Started", "Beginning change set application", cancellationToken);

            foreach (var item in changeSet.Items.OrderBy(i => i.Order))
            {
                var success = await ApplyItemAsync(changeSet.Id, item, cancellationToken);
                if (success)
                {
                    appliedItems.Add(item);
                }
                else
                {
                    allSucceeded = false;
                    _logger.LogWarning("Failed to apply item {ItemId} in change set {ChangeSetId}", item.Id, changeSet.Id);

                    // Rollback already applied items
                    await RollbackAppliedItemsAsync(changeSet.Id, appliedItems, cancellationToken);
                    break;
                }
            }

            if (allSucceeded)
            {
                changeSet.Status = ChangeSetStatus.Applied;
                changeSet.AppliedAt = DateTimeOffset.UtcNow;
                await _changeSetRepository.UpdateAsync(changeSet, cancellationToken);

                await LogExecutionAsync(changeSet.Id, null, ExecutionStep.Apply, "Completed",
                    $"Successfully applied all {changeSet.Items.Count} items", cancellationToken);

                _logger.LogInformation("Successfully applied change set {ChangeSetId}", changeSet.Id);
            }
            else
            {
                await LogExecutionAsync(changeSet.Id, null, ExecutionStep.Apply, "Failed",
                    "Change set application failed, changes rolled back", cancellationToken);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error applying change set {ChangeSetId}", changeSet.Id);

            await LogExecutionAsync(changeSet.Id, null, ExecutionStep.Apply, "Error",
                $"Unexpected error: {ex.Message}", cancellationToken);

            // Attempt rollback of applied items
            await RollbackAppliedItemsAsync(changeSet.Id, appliedItems, cancellationToken);
            allSucceeded = false;
        }

        return allSucceeded;
    }

    public async Task<bool> RollbackAsync(ChangeSet changeSet, Guid executedByUserId, string reason, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Rolling back change set {ChangeSetId}. Reason: {Reason}", changeSet.Id, reason);

        var allSucceeded = true;

        try
        {
            await LogExecutionAsync(changeSet.Id, null, ExecutionStep.Rollback, "Started",
                $"Beginning rollback. Reason: {reason}", cancellationToken);

            // Rollback in reverse order
            foreach (var item in changeSet.Items.OrderByDescending(i => i.Order))
            {
                var success = await RollbackItemAsync(changeSet.Id, item, cancellationToken);
                if (!success)
                {
                    allSucceeded = false;
                    _logger.LogWarning("Failed to rollback item {ItemId} in change set {ChangeSetId}", item.Id, changeSet.Id);
                }
            }

            changeSet.Status = ChangeSetStatus.RolledBack;
            changeSet.RolledBackAt = DateTimeOffset.UtcNow;
            changeSet.RollbackReason = reason;
            await _changeSetRepository.UpdateAsync(changeSet, cancellationToken);

            var status = allSucceeded ? "Completed" : "PartiallyCompleted";
            await LogExecutionAsync(changeSet.Id, null, ExecutionStep.Rollback, status,
                allSucceeded ? "Rollback completed successfully" : "Rollback completed with some failures", cancellationToken);

            _logger.LogInformation("Rollback of change set {ChangeSetId} completed. Success: {Success}", changeSet.Id, allSucceeded);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during rollback of change set {ChangeSetId}", changeSet.Id);

            await LogExecutionAsync(changeSet.Id, null, ExecutionStep.Rollback, "Error",
                $"Unexpected error during rollback: {ex.Message}", cancellationToken);

            allSucceeded = false;
        }

        return allSucceeded;
    }

    private async Task<bool> ApplyItemAsync(Guid changeSetId, ChangeItem item, CancellationToken cancellationToken)
    {
        try
        {
            // Execute the actual change based on target type and operation
            var result = await ExecuteChangeOperationAsync(item, true, cancellationToken);

            var status = result ? "Success" : "Failed";
            var message = result
                ? $"Applied {item.Operation} to {item.TargetType} {item.TargetId}"
                : $"Failed to apply {item.Operation} to {item.TargetType} {item.TargetId}";

            await LogExecutionAsync(changeSetId, item.Id, ExecutionStep.Apply, status, message, cancellationToken);

            return result;
        }
        catch (Exception ex)
        {
            await LogExecutionAsync(changeSetId, item.Id, ExecutionStep.Apply, "Error",
                $"Error applying change: {ex.Message}", cancellationToken);
            return false;
        }
    }

    private async Task<bool> RollbackItemAsync(Guid changeSetId, ChangeItem item, CancellationToken cancellationToken)
    {
        try
        {
            // Execute the rollback (reverse operation)
            var result = await ExecuteChangeOperationAsync(item, false, cancellationToken);

            var status = result ? "Success" : "Failed";
            var message = result
                ? $"Rolled back {item.Operation} on {item.TargetType} {item.TargetId}"
                : $"Failed to rollback {item.Operation} on {item.TargetType} {item.TargetId}";

            await LogExecutionAsync(changeSetId, item.Id, ExecutionStep.Rollback, status, message, cancellationToken);

            return result;
        }
        catch (Exception ex)
        {
            await LogExecutionAsync(changeSetId, item.Id, ExecutionStep.Rollback, "Error",
                $"Error during rollback: {ex.Message}", cancellationToken);
            return false;
        }
    }

    private async Task RollbackAppliedItemsAsync(Guid changeSetId, List<ChangeItem> appliedItems, CancellationToken cancellationToken)
    {
        if (!appliedItems.Any())
            return;

        _logger.LogInformation("Rolling back {Count} already applied items for change set {ChangeSetId}",
            appliedItems.Count, changeSetId);

        await LogExecutionAsync(changeSetId, null, ExecutionStep.Rollback, "Started",
            $"Auto-rollback of {appliedItems.Count} applied items due to failure", cancellationToken);

        foreach (var item in appliedItems.OrderByDescending(i => i.Order))
        {
            await RollbackItemAsync(changeSetId, item, cancellationToken);
        }
    }

    private Task<bool> ExecuteChangeOperationAsync(ChangeItem item, bool isApply, CancellationToken cancellationToken)
    {
        // This is where the actual execution would happen
        // In a real implementation, this would:
        // 1. Connect to the appropriate service/database for the target type
        // 2. Execute the operation (create/update/delete/enable/disable)
        // 3. For rollback, use CurrentValueJson to restore the original state

        // For demonstration, we simulate the execution
        var operation = isApply ? item.Operation : GetReverseOperation(item.Operation);

        _logger.LogDebug("Executing {Operation} on {TargetType} {TargetId}",
            operation, item.TargetType, item.TargetId);

        return item.TargetType switch
        {
            ChangeTargetType.Policy => ExecutePolicyChangeAsync(item, isApply, cancellationToken),
            ChangeTargetType.AutomationWorkflow => ExecuteWorkflowChangeAsync(item, isApply, cancellationToken),
            ChangeTargetType.TenantSetting => ExecuteTenantSettingChangeAsync(item, isApply, cancellationToken),
            ChangeTargetType.FederationProvider => ExecuteFederationChangeAsync(item, isApply, cancellationToken),
            ChangeTargetType.Application => ExecuteApplicationChangeAsync(item, isApply, cancellationToken),
            _ => Task.FromResult(false)
        };
    }

    private Task<bool> ExecutePolicyChangeAsync(ChangeItem item, bool isApply, CancellationToken cancellationToken)
    {
        // Simulate policy change execution
        // In real implementation: update policy in Authorization module
        var valueJson = isApply ? item.ProposedValueJson : item.CurrentValueJson;

        if (item.Operation == ChangeOperation.Delete && isApply)
        {
            _logger.LogDebug("Deleting policy {PolicyId}", item.TargetId);
        }
        else if (item.Operation == ChangeOperation.Create && isApply)
        {
            _logger.LogDebug("Creating policy with config: {Config}", valueJson);
        }
        else
        {
            _logger.LogDebug("Updating policy {PolicyId} with config: {Config}", item.TargetId, valueJson);
        }

        return Task.FromResult(true);
    }

    private Task<bool> ExecuteWorkflowChangeAsync(ChangeItem item, bool isApply, CancellationToken cancellationToken)
    {
        // Simulate workflow change execution
        // In real implementation: update workflow in Automation module
        var valueJson = isApply ? item.ProposedValueJson : item.CurrentValueJson;

        _logger.LogDebug("Executing workflow change on {WorkflowId}: {Operation}", item.TargetId, item.Operation);

        return Task.FromResult(true);
    }

    private Task<bool> ExecuteTenantSettingChangeAsync(ChangeItem item, bool isApply, CancellationToken cancellationToken)
    {
        // Simulate tenant setting change
        // In real implementation: update tenant settings
        var valueJson = isApply ? item.ProposedValueJson : item.CurrentValueJson;

        _logger.LogDebug("Updating tenant setting {SettingId} with value: {Value}", item.TargetId, valueJson);

        return Task.FromResult(true);
    }

    private Task<bool> ExecuteFederationChangeAsync(ChangeItem item, bool isApply, CancellationToken cancellationToken)
    {
        // Simulate federation change
        // In real implementation: update federation provider in Federation module
        var valueJson = isApply ? item.ProposedValueJson : item.CurrentValueJson;

        _logger.LogDebug("Executing federation change on provider {ProviderId}: {Operation}", item.TargetId, item.Operation);

        return Task.FromResult(true);
    }

    private Task<bool> ExecuteApplicationChangeAsync(ChangeItem item, bool isApply, CancellationToken cancellationToken)
    {
        // Simulate application change
        // In real implementation: update application in Applications module
        var valueJson = isApply ? item.ProposedValueJson : item.CurrentValueJson;

        _logger.LogDebug("Executing application change on {AppId}: {Operation}", item.TargetId, item.Operation);

        return Task.FromResult(true);
    }

    private static ChangeOperation GetReverseOperation(ChangeOperation operation)
    {
        return operation switch
        {
            ChangeOperation.Create => ChangeOperation.Delete,
            ChangeOperation.Delete => ChangeOperation.Create,
            ChangeOperation.Enable => ChangeOperation.Disable,
            ChangeOperation.Disable => ChangeOperation.Enable,
            ChangeOperation.Update => ChangeOperation.Update, // Rollback uses CurrentValueJson
            _ => operation
        };
    }

    private async Task LogExecutionAsync(Guid changeSetId, Guid? itemId, ExecutionStep step, string status, string message, CancellationToken cancellationToken)
    {
        var log = new ChangeExecutionLog
        {
            Id = Guid.NewGuid(),
            ChangeSetId = changeSetId,
            ItemId = itemId,
            Step = step,
            Status = status,
            Message = message,
            CreatedAt = DateTimeOffset.UtcNow
        };

        await _executionLogRepository.AddAsync(log, cancellationToken);
    }
}
