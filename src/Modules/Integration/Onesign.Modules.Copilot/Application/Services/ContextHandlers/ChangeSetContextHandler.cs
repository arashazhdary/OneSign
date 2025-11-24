using Microsoft.Extensions.Logging;
using Onesign.Modules.Copilot.Application.DTOs;
using Onesign.Modules.Copilot.Domain.Enums;
using Onesign.Modules.ChangeManagement.Domain.Repositories;
using Onesign.Modules.ChangeManagement.Domain.Enums;

namespace Onesign.Modules.Copilot.Application.Services.ContextHandlers;

public class ChangeSetContextHandler : IContextHandler
{
    private readonly ILogger<ChangeSetContextHandler> _logger;
    private readonly IChangeSetRepository _changeSetRepository;
    private readonly IChangeExecutionLogRepository _executionLogRepository;

    public ChangeSetContextHandler(
        ILogger<ChangeSetContextHandler> logger,
        IChangeSetRepository changeSetRepository,
        IChangeExecutionLogRepository executionLogRepository)
    {
        _logger = logger;
        _changeSetRepository = changeSetRepository;
        _executionLogRepository = executionLogRepository;
    }

    public ContextType SupportedContextType => ContextType.ChangeSet;

    public async Task<Dictionary<string, object?>> GetContextDataAsync(Guid tenantId, Guid? contextId, CancellationToken cancellationToken = default)
    {
        if (!contextId.HasValue)
        {
            _logger.LogWarning("ChangeSet context requested without change set ID for tenant {TenantId}", tenantId);
            return await GetChangeSetSummaryAsync(tenantId, cancellationToken);
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
            ["category"] = changeSetData.Category,
            ["requestedBy"] = changeSetData.RequestedBy,
            ["createdAt"] = changeSetData.CreatedAt,
            ["scheduledFor"] = changeSetData.ScheduledFor,
            ["items"] = changeSetData.Items,
            ["simulationSummary"] = changeSetData.SimulationSummary,
            ["executionLogs"] = changeSetData.ExecutionLogs
        };
    }

    private async Task<Dictionary<string, object?>> GetChangeSetSummaryAsync(Guid tenantId, CancellationToken cancellationToken)
    {
        try
        {
            var pendingChangeSets = await _changeSetRepository.GetByStatusAsync("Tenant", tenantId, ChangeSetStatus.InReview, cancellationToken);
            var draftChangeSets = await _changeSetRepository.GetByStatusAsync("Tenant", tenantId, ChangeSetStatus.Draft, cancellationToken);

            return new Dictionary<string, object?>
            {
                ["pendingApproval"] = pendingChangeSets?.Count ?? 0,
                ["drafts"] = draftChangeSets?.Count ?? 0
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get change set summary for tenant {TenantId}", tenantId);
            return new Dictionary<string, object?>();
        }
    }

    private async Task<ChangeSetContextData?> GetChangeSetDataAsync(Guid tenantId, Guid changeSetId, CancellationToken cancellationToken)
    {
        try
        {
            var changeSet = await _changeSetRepository.GetByIdWithDetailsAsync(changeSetId, cancellationToken);
            if (changeSet == null || changeSet.ScopeId != tenantId)
            {
                _logger.LogWarning("ChangeSet {ChangeSetId} not found for tenant {TenantId}", changeSetId, tenantId);
                return null;
            }

            // Get execution logs
            var executionLogs = await _executionLogRepository.GetByChangeSetIdAsync(changeSetId, cancellationToken);
            var executionLogDtos = executionLogs?.Select(log => new ExecutionLogDto
            {
                LogId = log.Id,
                Action = log.Step.ToString(),
                Status = log.Status,
                Message = log.Message ?? string.Empty,
                Timestamp = log.CreatedAt
            }).ToList() ?? new List<ExecutionLogDto>();

            // Map change items
            var items = changeSet.Items?.Select(item => new ChangeItemDto
            {
                ItemId = item.Id,
                ChangeType = item.Operation.ToString(),
                EntityType = item.TargetType.ToString(),
                EntityId = item.TargetId,
                EntityName = item.TargetId.ToString(), // Display name would need to be fetched separately
                Description = $"Change {item.Operation} on {item.TargetType}"
            }).ToList() ?? new List<ChangeItemDto>();

            // Build simulation summary from change set data
            SimulationSummaryDto? simulationSummary = null;
            if (!string.IsNullOrEmpty(changeSet.SimulationSummaryJson))
            {
                // Parse simulation summary from JSON if needed
                simulationSummary = new SimulationSummaryDto
                {
                    AffectedUsers = 0, // Would need to parse from JSON
                    AffectedApplications = 0,
                    AffectedPolicies = 0,
                    Warnings = new List<string>(),
                    Recommendations = new List<string>()
                };
            }

            return new ChangeSetContextData
            {
                ChangeSetId = changeSet.Id,
                Name = changeSet.Title,
                Status = changeSet.Status.ToString(),
                Description = changeSet.Description ?? string.Empty,
                Category = changeSet.Category.ToString(),
                RequestedBy = changeSet.RequestedByUserId.ToString(), // Display name would need to be fetched separately
                CreatedAt = changeSet.CreatedAt,
                ScheduledFor = changeSet.ScheduledFor,
                Items = items,
                SimulationSummary = simulationSummary,
                ExecutionLogs = executionLogDtos.Cast<object>().ToList()
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get change set data for {ChangeSetId}", changeSetId);
            return null;
        }
    }
}

public class ExecutionLogDto
{
    public Guid LogId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public DateTimeOffset Timestamp { get; set; }
}
