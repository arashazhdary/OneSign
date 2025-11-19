using System.Text.Json;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Hunting.Application.DTOs;
using Onesign.Modules.Hunting.Domain.Enums;

namespace Onesign.Modules.Hunting.Application.Services;

public class SignInEventsQueryService : IDatasetQueryService
{
    private readonly ILogger<SignInEventsQueryService> _logger;

    public HuntDataset Dataset => HuntDataset.SignInEvents;

    public SignInEventsQueryService(ILogger<SignInEventsQueryService> logger)
    {
        _logger = logger;
    }

    public bool CanHandle(HuntDataset dataset) => dataset == HuntDataset.SignInEvents;

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
        _logger.LogDebug("Querying SignInEvents for {ScopeType}/{ScopeId}", scopeType, scopeId);

        var rows = new List<JsonElement>();
        var sampleData = GenerateSampleSignInEvents(scopeType, scopeId, start, end, limit);

        foreach (var item in sampleData)
        {
            if (cancellationToken.IsCancellationRequested)
                break;

            if (MatchesFilter(item, filter))
            {
                var selected = SelectColumns(item, selectColumns);
                rows.Add(selected);
            }
        }

        if (sort != null)
        {
            rows = ApplySort(rows, sort);
        }

        var result = rows.Take(limit).ToList();

        return await Task.FromResult((result, (long)result.Count * 10, sampleData.Count));
    }

    private List<Dictionary<string, object>> GenerateSampleSignInEvents(
        string scopeType, Guid scopeId, DateTimeOffset start, DateTimeOffset end, int limit)
    {
        var events = new List<Dictionary<string, object>>();
        var random = new Random();
        var statuses = new[] { "Success", "Failed", "MfaRequired", "Blocked" };
        var methods = new[] { "Password", "SSO", "Passwordless", "Certificate" };
        var apps = new[] { "WebPortal", "MobileApp", "API", "AdminConsole" };
        var riskLevels = new[] { "None", "Low", "Medium", "High" };

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
                ["userPrincipalName"] = $"user{random.Next(1, 1000)}@contoso.com",
                ["displayName"] = $"User {random.Next(1, 1000)}",
                ["status"] = statuses[random.Next(statuses.Length)],
                ["authMethod"] = methods[random.Next(methods.Length)],
                ["application"] = apps[random.Next(apps.Length)],
                ["ipAddress"] = $"192.168.{random.Next(1, 255)}.{random.Next(1, 255)}",
                ["location"] = new Dictionary<string, object>
                {
                    ["city"] = "Seattle",
                    ["country"] = "US",
                    ["latitude"] = 47.6062 + random.NextDouble() * 0.1,
                    ["longitude"] = -122.3321 + random.NextDouble() * 0.1
                },
                ["deviceInfo"] = new Dictionary<string, object>
                {
                    ["browser"] = "Chrome",
                    ["os"] = "Windows 11",
                    ["deviceId"] = Guid.NewGuid().ToString()
                },
                ["riskLevel"] = riskLevels[random.Next(riskLevels.Length)],
                ["mfaCompleted"] = random.NextDouble() > 0.3,
                ["correlationId"] = Guid.NewGuid()
            });
        }

        return events.OrderByDescending(e => (DateTimeOffset)e["timestamp"]).ToList();
    }

    private bool MatchesFilter(Dictionary<string, object> item, OqlFilterDto? filter)
    {
        if (filter == null) return true;
        return DatasetQueryHelper.EvaluateFilter(item, filter);
    }

    private JsonElement SelectColumns(Dictionary<string, object> item, List<string>? columns)
    {
        return DatasetQueryHelper.SelectColumns(item, columns);
    }

    private List<JsonElement> ApplySort(List<JsonElement> rows, OqlSortDto sort)
    {
        return DatasetQueryHelper.ApplySort(rows, sort);
    }
}
