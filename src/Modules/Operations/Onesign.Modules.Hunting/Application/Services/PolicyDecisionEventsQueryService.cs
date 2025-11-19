using System.Text.Json;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Hunting.Application.DTOs;
using Onesign.Modules.Hunting.Domain.Enums;

namespace Onesign.Modules.Hunting.Application.Services;

public class PolicyDecisionEventsQueryService : IDatasetQueryService
{
    private readonly ILogger<PolicyDecisionEventsQueryService> _logger;

    public HuntDataset Dataset => HuntDataset.PolicyDecisionEvents;

    public PolicyDecisionEventsQueryService(ILogger<PolicyDecisionEventsQueryService> logger)
    {
        _logger = logger;
    }

    public bool CanHandle(HuntDataset dataset) => dataset == HuntDataset.PolicyDecisionEvents;

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
        _logger.LogDebug("Querying PolicyDecisionEvents for {ScopeType}/{ScopeId}", scopeType, scopeId);

        var rows = new List<JsonElement>();
        var sampleData = GenerateSamplePolicyDecisionEvents(scopeType, scopeId, start, end, limit);

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

    private List<Dictionary<string, object>> GenerateSamplePolicyDecisionEvents(
        string scopeType, Guid scopeId, DateTimeOffset start, DateTimeOffset end, int limit)
    {
        var events = new List<Dictionary<string, object>>();
        var random = new Random();
        var decisions = new[] { "Allow", "Deny", "Challenge", "Report" };
        var policyTypes = new[] { "ConditionalAccess", "SessionPolicy", "DataProtection", "Compliance", "RiskBased" };
        var triggers = new[] { "SignIn", "ResourceAccess", "DataAccess", "AdminAction", "RiskDetection" };

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
                ["userName"] = $"user{random.Next(1, 1000)}@contoso.com",
                ["policyId"] = Guid.NewGuid(),
                ["policyName"] = $"Policy-{random.Next(1, 50)}",
                ["policyType"] = policyTypes[random.Next(policyTypes.Length)],
                ["decision"] = decisions[random.Next(decisions.Length)],
                ["trigger"] = triggers[random.Next(triggers.Length)],
                ["resourceId"] = Guid.NewGuid(),
                ["resourceName"] = $"App-{random.Next(1, 100)}",
                ["conditions"] = new Dictionary<string, object>
                {
                    ["location"] = random.NextDouble() > 0.5,
                    ["device"] = random.NextDouble() > 0.5,
                    ["riskLevel"] = random.NextDouble() > 0.5,
                    ["userGroup"] = random.NextDouble() > 0.5
                },
                ["enforcedControls"] = new[] { "MFA", "CompliantDevice" }.Take(random.Next(0, 3)).ToArray(),
                ["evaluationTimeMs"] = random.Next(1, 100),
                ["correlationId"] = Guid.NewGuid()
            });
        }

        return events.OrderByDescending(e => (DateTimeOffset)e["timestamp"]).ToList();
    }
}
