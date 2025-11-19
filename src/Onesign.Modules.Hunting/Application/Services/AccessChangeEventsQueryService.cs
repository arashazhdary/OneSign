using System.Text.Json;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Hunting.Application.DTOs;
using Onesign.Modules.Hunting.Domain.Enums;

namespace Onesign.Modules.Hunting.Application.Services;

public class AccessChangeEventsQueryService : IDatasetQueryService
{
    private readonly ILogger<AccessChangeEventsQueryService> _logger;

    public HuntDataset Dataset => HuntDataset.AccessChangeEvents;

    public AccessChangeEventsQueryService(ILogger<AccessChangeEventsQueryService> logger)
    {
        _logger = logger;
    }

    public bool CanHandle(HuntDataset dataset) => dataset == HuntDataset.AccessChangeEvents;

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
        _logger.LogDebug("Querying AccessChangeEvents for {ScopeType}/{ScopeId}", scopeType, scopeId);

        var rows = new List<JsonElement>();
        var sampleData = GenerateSampleAccessChangeEvents(scopeType, scopeId, start, end, limit);

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

    private List<Dictionary<string, object>> GenerateSampleAccessChangeEvents(
        string scopeType, Guid scopeId, DateTimeOffset start, DateTimeOffset end, int limit)
    {
        var events = new List<Dictionary<string, object>>();
        var random = new Random();
        var changeTypes = new[] { "RoleAssigned", "RoleRemoved", "GroupAdded", "GroupRemoved", "PermissionGranted", "PermissionRevoked" };
        var sources = new[] { "Admin", "Automation", "AccessRequest", "Sync", "API" };
        var resourceTypes = new[] { "Application", "Group", "Role", "Permission", "Entitlement" };

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
                ["targetUserId"] = Guid.NewGuid(),
                ["targetUserName"] = $"user{random.Next(1, 1000)}@contoso.com",
                ["changeType"] = changeTypes[random.Next(changeTypes.Length)],
                ["source"] = sources[random.Next(sources.Length)],
                ["resourceType"] = resourceTypes[random.Next(resourceTypes.Length)],
                ["resourceId"] = Guid.NewGuid(),
                ["resourceName"] = $"Resource-{random.Next(1, 100)}",
                ["performedBy"] = Guid.NewGuid(),
                ["performedByName"] = $"admin{random.Next(1, 50)}@contoso.com",
                ["justification"] = random.NextDouble() > 0.5 ? $"Access request #{random.Next(1000, 9999)}" : null,
                ["isHighRisk"] = random.NextDouble() > 0.8,
                ["previousValue"] = random.NextDouble() > 0.5 ? "Member" : null,
                ["newValue"] = "Owner",
                ["correlationId"] = Guid.NewGuid()
            });
        }

        return events.OrderByDescending(e => (DateTimeOffset)e["timestamp"]).ToList();
    }
}
