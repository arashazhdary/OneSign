using System.Text.Json;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Hunting.Application.DTOs;
using Onesign.Modules.Hunting.Domain.Enums;

namespace Onesign.Modules.Hunting.Application.Services;

public class IncidentEventsQueryService : IDatasetQueryService
{
    private readonly ILogger<IncidentEventsQueryService> _logger;

    public HuntDataset Dataset => HuntDataset.IncidentEvents;

    public IncidentEventsQueryService(ILogger<IncidentEventsQueryService> logger)
    {
        _logger = logger;
    }

    public bool CanHandle(HuntDataset dataset) => dataset == HuntDataset.IncidentEvents;

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
        _logger.LogDebug("Querying IncidentEvents for {ScopeType}/{ScopeId}", scopeType, scopeId);

        var rows = new List<JsonElement>();
        var sampleData = GenerateSampleIncidentEvents(scopeType, scopeId, start, end, limit);

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

    private List<Dictionary<string, object>> GenerateSampleIncidentEvents(
        string scopeType, Guid scopeId, DateTimeOffset start, DateTimeOffset end, int limit)
    {
        var events = new List<Dictionary<string, object>>();
        var random = new Random();
        var severities = new[] { "Low", "Medium", "High", "Critical" };
        var statuses = new[] { "New", "InProgress", "Resolved", "Closed", "Dismissed" };
        var categories = new[] { "CompromisedAccount", "DataExfiltration", "PrivilegeEscalation", "AnomalousActivity", "PolicyViolation", "MaliciousApp" };
        var sources = new[] { "RiskDetection", "Hunt", "UserReport", "Automation", "External" };

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
                ["incidentId"] = Guid.NewGuid(),
                ["title"] = $"Incident: {categories[random.Next(categories.Length)]} detected",
                ["severity"] = severities[random.Next(severities.Length)],
                ["status"] = statuses[random.Next(statuses.Length)],
                ["category"] = categories[random.Next(categories.Length)],
                ["source"] = sources[random.Next(sources.Length)],
                ["affectedUserId"] = Guid.NewGuid(),
                ["affectedUserName"] = $"user{random.Next(1, 1000)}@contoso.com",
                ["assignedTo"] = random.NextDouble() > 0.3 ? Guid.NewGuid().ToString() : null,
                ["assignedToName"] = random.NextDouble() > 0.3 ? $"analyst{random.Next(1, 20)}@contoso.com" : null,
                ["alertCount"] = random.Next(1, 50),
                ["indicators"] = new[] { "UnusualLocation", "ImpossibleTravel", "BruteForce" }.Take(random.Next(1, 4)).ToArray(),
                ["firstActivityTime"] = timestamp.AddHours(-random.Next(1, 72)),
                ["lastActivityTime"] = timestamp,
                ["resolvedAt"] = random.NextDouble() > 0.5 ? timestamp.AddHours(random.Next(1, 168)) : (DateTimeOffset?)null,
                ["mitigationActions"] = random.Next(0, 10),
                ["correlationId"] = Guid.NewGuid()
            });
        }

        return events.OrderByDescending(e => (DateTimeOffset)e["timestamp"]).ToList();
    }
}
