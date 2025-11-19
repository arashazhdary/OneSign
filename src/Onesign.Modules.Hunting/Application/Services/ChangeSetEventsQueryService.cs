using System.Text.Json;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Hunting.Application.DTOs;
using Onesign.Modules.Hunting.Domain.Enums;

namespace Onesign.Modules.Hunting.Application.Services;

public class ChangeSetEventsQueryService : IDatasetQueryService
{
    private readonly ILogger<ChangeSetEventsQueryService> _logger;

    public HuntDataset Dataset => HuntDataset.ChangeSetEvents;

    public ChangeSetEventsQueryService(ILogger<ChangeSetEventsQueryService> logger)
    {
        _logger = logger;
    }

    public bool CanHandle(HuntDataset dataset) => dataset == HuntDataset.ChangeSetEvents;

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
        _logger.LogDebug("Querying ChangeSetEvents for {ScopeType}/{ScopeId}", scopeType, scopeId);

        var rows = new List<JsonElement>();
        var sampleData = GenerateSampleChangeSetEvents(scopeType, scopeId, start, end, limit);

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

    private List<Dictionary<string, object>> GenerateSampleChangeSetEvents(
        string scopeType, Guid scopeId, DateTimeOffset start, DateTimeOffset end, int limit)
    {
        var events = new List<Dictionary<string, object>>();
        var random = new Random();
        var statuses = new[] { "Draft", "InReview", "Approved", "Scheduled", "Applied", "RolledBack" };
        var categories = new[] { "PolicyConfig", "TenantSettings", "FederationConfig", "AutomationConfig", "ApplicationConfig" };
        var operations = new[] { "Create", "Update", "Delete", "Enable", "Disable" };

        var count = Math.Min(limit * 2, 1000);
        var timeSpan = end - start;

        for (int i = 0; i < count; i++)
        {
            var timestamp = start.AddTicks((long)(timeSpan.Ticks * random.NextDouble()));
            events.Add(new Dictionary<string, object>
            {
                ["id"] = Guid.NewGuid(),
                ["timestamp"] = timestamp,
                ["scopeType"] = scopeType,
                ["scopeId"] = scopeId,
                ["changeSetId"] = Guid.NewGuid(),
                ["title"] = $"Change Set #{random.Next(1000, 9999)}",
                ["category"] = categories[random.Next(categories.Length)],
                ["status"] = statuses[random.Next(statuses.Length)],
                ["requestedBy"] = Guid.NewGuid(),
                ["requestedByName"] = $"admin{random.Next(1, 50)}@contoso.com",
                ["approvedBy"] = random.NextDouble() > 0.3 ? Guid.NewGuid().ToString() : null,
                ["itemCount"] = random.Next(1, 20),
                ["operations"] = new[] { operations[random.Next(operations.Length)], operations[random.Next(operations.Length)] }.Distinct().ToArray(),
                ["impactedUsers"] = random.Next(0, 1000),
                ["riskDirection"] = random.NextDouble() > 0.7 ? "Increased" : random.NextDouble() > 0.5 ? "Decreased" : "Neutral",
                ["appliedAt"] = random.NextDouble() > 0.5 ? timestamp.AddHours(random.Next(1, 48)) : (DateTimeOffset?)null,
                ["correlationId"] = Guid.NewGuid()
            });
        }

        return events.OrderByDescending(e => (DateTimeOffset)e["timestamp"]).ToList();
    }
}
