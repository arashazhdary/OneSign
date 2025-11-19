using Microsoft.Extensions.Logging;
using Onesign.Modules.Copilot.Application.DTOs;
using Onesign.Modules.Copilot.Domain.Enums;

namespace Onesign.Modules.Copilot.Application.Services.ContextHandlers;

public class PolicyContextHandler : IContextHandler
{
    private readonly ILogger<PolicyContextHandler> _logger;

    public PolicyContextHandler(ILogger<PolicyContextHandler> logger)
    {
        _logger = logger;
    }

    public ContextType SupportedContextType => ContextType.Policy;

    public async Task<Dictionary<string, object?>> GetContextDataAsync(Guid tenantId, Guid? contextId, CancellationToken cancellationToken = default)
    {
        if (!contextId.HasValue)
        {
            _logger.LogWarning("Policy context requested without policy ID for tenant {TenantId}", tenantId);
            return new Dictionary<string, object?>();
        }

        _logger.LogDebug("Building policy context for tenant {TenantId}, policy {PolicyId}", tenantId, contextId.Value);

        var policyData = await GetPolicyDataAsync(tenantId, contextId.Value, cancellationToken);
        if (policyData == null)
        {
            return new Dictionary<string, object?>();
        }

        return new Dictionary<string, object?>
        {
            ["policyId"] = policyData.PolicyId,
            ["policyName"] = policyData.PolicyName,
            ["policyType"] = policyData.PolicyType,
            ["description"] = policyData.Description,
            ["rules"] = policyData.Rules,
            ["matchCount"] = policyData.MatchCount,
            ["recentMatches"] = policyData.RecentMatches
        };
    }

    private Task<PolicyContextData?> GetPolicyDataAsync(Guid tenantId, Guid policyId, CancellationToken cancellationToken)
    {
        // Integration with Authorization/Governance modules would go here
        var data = new PolicyContextData
        {
            PolicyId = policyId,
            PolicyName = string.Empty,
            PolicyType = string.Empty,
            Description = string.Empty,
            Rules = new List<PolicyRuleDto>(),
            MatchCount = 0,
            RecentMatches = new List<PolicyMatchDto>()
        };

        return Task.FromResult<PolicyContextData?>(data);
    }
}
