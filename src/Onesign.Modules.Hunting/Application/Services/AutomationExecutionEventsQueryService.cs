using System.Text.Json;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Hunting.Application.DTOs;
using Onesign.Modules.Hunting.Domain.Enums;

namespace Onesign.Modules.Hunting.Application.Services;

public class AutomationExecutionEventsQueryService : IDatasetQueryService
{
    private readonly ILogger<AutomationExecutionEventsQueryService> _logger;

    public HuntDataset Dataset => HuntDataset.AutomationExecutionEvents;

    public AutomationExecutionEventsQueryService(ILogger<AutomationExecutionEventsQueryService> logger)
    {
        _logger = logger;
    }

    public bool CanHandle(HuntDataset dataset) => dataset == HuntDataset.AutomationExecutionEvents;

    public async Task<(List<JsonElement> Rows, long TotalApprox, int RowsScanned)> QueryAsync(
        string scopeType,
        Guid scopeId,
        DateTimeOffset start,
        DateTimeOffset end,
        OqlFilterDto? filter,
        List<string>? selectColumns,
        OqlSortDto? sort,
        int limit,
        CancellationToken cancellationToken = default)
    {
        _logger.LogDebug("Querying AutomationExecutionEvents for {ScopeType}/{ScopeId}", scopeType, scopeId);

        var rows = new List<JsonElement>();
        var sampleData = GenerateSampleAutomationExecutionEvents(scopeType, scopeId, start, end, limit);

        foreach (var item in sampleData)
        {
            if (cancellationToken.IsCancellationRequested)
                break;

            if (DatasetQueryHelper.EvaluateFilter(item, filter))
            {
                var selected = DatasetQueryHelper.SelectColumns(item, selectColumns);
                rows.Add(selected);
            }
        }

        if (sort != null)
        {
            rows = DatasetQueryHelper.ApplySort(rows, sort);
        }

        var result = rows.Take(limit).ToList();

        return await Task.FromResult((result, (long)result.Count * 10, sampleData.Count));
    }

    private List<Dictionary<string, object>> GenerateSampleAutomationExecutionEvents(
        string scopeType, Guid scopeId, DateTimeOffset start, DateTimeOffset end, int limit)
    {
        var events = new List<Dictionary<string, object>>();
        var random = new Random();
        var statuses = new[] { "Completed", "Failed", "Cancelled", "TimedOut", "Skipped" };
        var triggerTypes = new[] { "Scheduled", "EventDriven", "Manual", "API", "Webhook" };
        var workflowTypes = new[] { "Provisioning", "Deprovisioning", "AccessReview", "Remediation", "Notification" };

        var count = Math.Min(limit * 2, 1000);
        var timeSpan = end - start;

        for (int i = 0; i < count; i++)
        {
            var timestamp = start.AddTicks((long)(timeSpan.Ticks * random.NextDouble()));
            var duration = random.Next(100, 60000);
            events.Add(new Dictionary<string, object>
            {
                ["id"] = Guid.NewGuid(),
                ["timestamp"] = timestamp,
                ["scopeType"] = scopeType,
                ["scopeId"] = scopeId,
                ["workflowId"] = Guid.NewGuid(),
                ["workflowName"] = $"Workflow-{random.Next(1, 100)}",
                ["workflowType"] = workflowTypes[random.Next(workflowTypes.Length)],
                ["runId"] = Guid.NewGuid(),
                ["status"] = statuses[random.Next(statuses.Length)],
                ["triggerType"] = triggerTypes[random.Next(triggerTypes.Length)],
                ["triggeredBy"] = random.NextDouble() > 0.5 ? Guid.NewGuid().ToString() : "System",
                ["startTime"] = timestamp,
                ["endTime"] = timestamp.AddMilliseconds(duration),
                ["durationMs"] = duration,
                ["actionsExecuted"] = random.Next(1, 20),
                ["actionsSucceeded"] = random.Next(0, 15),
                ["actionsFailed"] = random.Next(0, 5),
                ["affectedUsers"] = random.Next(0, 100),
                ["errorMessage"] = random.NextDouble() > 0.8 ? $"Error in step {random.Next(1, 10)}" : null,
                ["correlationId"] = Guid.NewGuid()
            });
        }

        return events.OrderByDescending(e => (DateTimeOffset)e["timestamp"]).ToList();
    }
}
