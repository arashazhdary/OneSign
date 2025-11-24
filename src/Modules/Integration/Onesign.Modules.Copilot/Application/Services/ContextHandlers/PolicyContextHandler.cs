using Microsoft.Extensions.Logging;
using Onesign.Modules.Copilot.Application.DTOs;
using Onesign.Modules.Copilot.Domain.Enums;
using Onesign.Modules.Governance.Domain.Repositories;

namespace Onesign.Modules.Copilot.Application.Services.ContextHandlers;

public class PolicyContextHandler : IContextHandler
{
    private readonly ILogger<PolicyContextHandler> _logger;
    private readonly IAccessReviewCampaignRepository _accessReviewRepository;
    private readonly ISodViolationRepository _sodViolationRepository;

    public PolicyContextHandler(
        ILogger<PolicyContextHandler> logger,
        IAccessReviewCampaignRepository accessReviewRepository,
        ISodViolationRepository sodViolationRepository)
    {
        _logger = logger;
        _accessReviewRepository = accessReviewRepository;
        _sodViolationRepository = sodViolationRepository;
    }

    public ContextType SupportedContextType => ContextType.Policy;

    public async Task<Dictionary<string, object?>> GetContextDataAsync(Guid tenantId, Guid? contextId, CancellationToken cancellationToken = default)
    {
        if (!contextId.HasValue)
        {
            _logger.LogWarning("Policy context requested without policy ID for tenant {TenantId}", tenantId);
            return await GetPolicySummaryAsync(tenantId, cancellationToken);
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
            ["status"] = policyData.Status,
            ["rules"] = policyData.Rules,
            ["matchCount"] = policyData.MatchCount,
            ["recentMatches"] = policyData.RecentMatches,
            ["affectedUsers"] = policyData.AffectedUsers,
            ["affectedApplications"] = policyData.AffectedApplications
        };
    }

    private async Task<Dictionary<string, object?>> GetPolicySummaryAsync(Guid tenantId, CancellationToken cancellationToken)
    {
        try
        {
            // Get summary of policies across the tenant
            var allCampaigns = await _accessReviewRepository.GetByTenantIdAsync(tenantId, cancellationToken);
            var activeCampaigns = allCampaigns?.Where(c => c.Status == Onesign.Modules.Governance.Domain.Enums.CampaignStatus.Active).ToList() ?? new List<Onesign.Modules.Governance.Domain.Entities.AccessReviewCampaign>();
            var sodViolations = await _sodViolationRepository.GetByTenantIdAsync(tenantId, null, cancellationToken);

            return new Dictionary<string, object?>
            {
                ["activeCampaigns"] = activeCampaigns.Count,
                ["pendingReviews"] = activeCampaigns.Sum(c => c.ReviewItems?.Count(ri => ri.Decision == Onesign.Modules.Governance.Domain.Enums.ReviewDecision.Pending) ?? 0),
                ["sodViolations"] = sodViolations?.Count ?? 0,
                ["criticalViolations"] = sodViolations?.Count(v => v.Severity == Onesign.Modules.Governance.Domain.Enums.ViolationSeverity.Critical) ?? 0
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get policy summary for tenant {TenantId}", tenantId);
            return new Dictionary<string, object?>();
        }
    }

    private async Task<PolicyContextData?> GetPolicyDataAsync(Guid tenantId, Guid policyId, CancellationToken cancellationToken)
    {
        try
        {
            // Try to find as access review campaign first
            var campaign = await _accessReviewRepository.GetByIdAsync(policyId, cancellationToken);
            if (campaign != null && campaign.TenantId == tenantId)
            {
                return new PolicyContextData
                {
                    PolicyId = campaign.Id,
                    PolicyName = campaign.Name,
                    PolicyType = "AccessReview",
                    Description = campaign.Description ?? string.Empty,
                    Status = campaign.Status.ToString(),
                    Rules = new List<PolicyRuleDto>
                    {
                        new PolicyRuleDto
                        {
                            RuleName = "Review Schedule",
                            Condition = $"From {campaign.StartDate:yyyy-MM-dd} to {campaign.EndDate:yyyy-MM-dd}",
                            Action = "Request access certification"
                        }
                    },
                    MatchCount = campaign.ReviewItems?.Count ?? 0,
                    RecentMatches = new List<PolicyMatchDto>(),
                    AffectedUsers = campaign.ReviewItems?.Select(ri => ri.UserId).Distinct().Count() ?? 0,
                    AffectedApplications = campaign.ReviewItems?.Where(ri => ri.ResourceType == "Application").Select(ri => ri.ResourceId).Distinct().Count() ?? 0
                };
            }

            // If not found as campaign, return generic policy data
            return new PolicyContextData
            {
                PolicyId = policyId,
                PolicyName = string.Empty,
                PolicyType = string.Empty,
                Description = string.Empty,
                Status = "Unknown",
                Rules = new List<PolicyRuleDto>(),
                MatchCount = 0,
                RecentMatches = new List<PolicyMatchDto>(),
                AffectedUsers = 0,
                AffectedApplications = 0
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get policy data for {PolicyId}", policyId);
            return null;
        }
    }
}
