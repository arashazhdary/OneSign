using System.Text.Json;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Hunting.Application.DTOs;
using Onesign.Modules.Hunting.Domain.Enums;

namespace Onesign.Modules.Hunting.Application.Services;

public class PrivilegedAccessEventsQueryService : IDatasetQueryService
{
    private readonly ILogger<PrivilegedAccessEventsQueryService> _logger;

    public HuntDataset Dataset => HuntDataset.PrivilegedAccessEvents;

    public PrivilegedAccessEventsQueryService(ILogger<PrivilegedAccessEventsQueryService> logger)
    {
        _logger = logger;
    }

    public bool CanHandle(HuntDataset dataset) => dataset == HuntDataset.PrivilegedAccessEvents;

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
        _logger.LogDebug("Querying PrivilegedAccessEvents for {ScopeType}/{ScopeId}", scopeType, scopeId);

        var rows = new List<JsonElement>();
        var sampleData = GenerateSamplePrivilegedAccessEvents(scopeType, scopeId, start, end, limit);

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

    private List<Dictionary<string, object>> GenerateSamplePrivilegedAccessEvents(
        string scopeType, Guid scopeId, DateTimeOffset start, DateTimeOffset end, int limit)
    {
        var events = new List<Dictionary<string, object>>();
        var random = new Random();
        var actionTypes = new[] { "Elevation", "SessionStart", "SessionEnd", "CommandExecution", "CredentialCheckout", "CredentialCheckin" };
        var riskLevels = new[] { "Low", "Medium", "High", "Critical" };
        var targetSystems = new[] { "AzureAD", "AWS", "GCP", "Database", "Server", "Application" };

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
                ["userId"] = Guid.NewGuid(),
                ["userName"] = $"admin{random.Next(1, 100)}@contoso.com",
                ["actionType"] = actionTypes[random.Next(actionTypes.Length)],
                ["targetSystem"] = targetSystems[random.Next(targetSystems.Length)],
                ["targetResource"] = $"Resource-{random.Next(1, 100)}",
                ["privilegedRoleId"] = Guid.NewGuid(),
                ["privilegedRoleName"] = $"PrivRole-{random.Next(1, 20)}",
                ["riskLevel"] = riskLevels[random.Next(riskLevels.Length)],
                ["duration"] = TimeSpan.FromMinutes(random.Next(5, 480)),
                ["ipAddress"] = $"10.0.{random.Next(1, 255)}.{random.Next(1, 255)}",
                ["justification"] = $"Ticket #{random.Next(10000, 99999)}",
                ["approvedBy"] = random.NextDouble() > 0.3 ? Guid.NewGuid().ToString() : null,
                ["wasSuccessful"] = random.NextDouble() > 0.1,
                ["correlationId"] = Guid.NewGuid()
            });
        }

        return events.OrderByDescending(e => (DateTimeOffset)e["timestamp"]).ToList();
    }
}
