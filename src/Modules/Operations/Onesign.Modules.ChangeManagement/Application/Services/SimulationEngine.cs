using System.Text.Json;
using Microsoft.Extensions.Logging;
using Onesign.Modules.ChangeManagement.Application.DTOs;
using Onesign.Modules.ChangeManagement.Domain.Entities;
using Onesign.Modules.ChangeManagement.Domain.Enums;

namespace Onesign.Modules.ChangeManagement.Application.Services;

public class SimulationEngine : ISimulationEngine
{
    private readonly ILogger<SimulationEngine> _logger;

    public SimulationEngine(ILogger<SimulationEngine> logger)
    {
        _logger = logger;
    }

    public Task<SimulationResultDto> SimulateAsync(ChangeSet changeSet, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Simulating change set {ChangeSetId} with {ItemCount} items", changeSet.Id, changeSet.Items.Count);

        var result = new SimulationResultDto();
        var riskScore = 0;

        foreach (var item in changeSet.Items)
        {
            var itemImpact = AnalyzeItemImpact(item, result);
            riskScore += itemImpact;
        }

        // Analyze cross-item impacts
        AnalyzeCrossItemImpacts(changeSet, result, ref riskScore);

        // Determine risk direction based on accumulated score
        result.RiskDirection = riskScore switch
        {
            < -10 => "Decreased",
            > 10 => "Increased",
            _ => "Neutral"
        };

        // Generate warnings based on analysis
        GenerateWarnings(changeSet, result);

        // Generate recommendations
        GenerateRecommendations(changeSet, result);

        _logger.LogInformation("Simulation completed for change set {ChangeSetId}. Risk direction: {RiskDirection}",
            changeSet.Id, result.RiskDirection);

        return Task.FromResult(result);
    }

    private int AnalyzeItemImpact(ChangeItem item, SimulationResultDto result)
    {
        var riskScore = 0;

        switch (item.TargetType)
        {
            case ChangeTargetType.Policy:
                result.PoliciesAffected.Add(item.TargetId.ToString());
                riskScore += AnalyzePolicyChange(item, result);
                break;

            case ChangeTargetType.AutomationWorkflow:
                result.AutomationWorkflowsAffected.Add(item.TargetId.ToString());
                riskScore += AnalyzeWorkflowChange(item, result);
                break;

            case ChangeTargetType.TenantSetting:
                riskScore += AnalyzeTenantSettingChange(item, result);
                break;

            case ChangeTargetType.FederationProvider:
                riskScore += AnalyzeFederationChange(item, result);
                break;

            case ChangeTargetType.Application:
                result.ImpactedAppsCount++;
                riskScore += AnalyzeApplicationChange(item, result);
                break;
        }

        // Operation-based risk adjustment
        riskScore += item.Operation switch
        {
            ChangeOperation.Delete => 5,
            ChangeOperation.Disable => 3,
            ChangeOperation.Create => 1,
            ChangeOperation.Update => 2,
            ChangeOperation.Enable => -1,
            _ => 0
        };

        return riskScore;
    }

    private int AnalyzePolicyChange(ChangeItem item, SimulationResultDto result)
    {
        var riskScore = 0;

        if (item.ProposedValueJson != null)
        {
            try
            {
                using var doc = JsonDocument.Parse(item.ProposedValueJson);
                var root = doc.RootElement;

                // Check for scope changes that affect users
                if (root.TryGetProperty("scope", out var scope) ||
                    root.TryGetProperty("userGroups", out _) ||
                    root.TryGetProperty("users", out _))
                {
                    // Estimate affected users based on policy scope
                    var estimatedUsers = EstimateAffectedUsers(root);
                    result.ImpactedUsersCount += estimatedUsers;

                    // Check if privileged users might be affected
                    if (root.TryGetProperty("includePrivileged", out var includePriv) && includePriv.GetBoolean())
                    {
                        result.PrivilegedUsersAffectedCount += Math.Max(1, estimatedUsers / 10);
                        riskScore += 5;
                    }
                }

                // Check for permission changes
                if (root.TryGetProperty("permissions", out _) || root.TryGetProperty("allowedActions", out _))
                {
                    riskScore += 3;
                }

                // Check for MFA or security-related changes
                if (root.TryGetProperty("requireMfa", out var mfa))
                {
                    if (!mfa.GetBoolean())
                    {
                        riskScore += 10;
                        result.Warnings.Add("Disabling MFA requirement increases security risk");
                    }
                    else
                    {
                        riskScore -= 5;
                    }
                }
            }
            catch (JsonException)
            {
                // If we can't parse, assume moderate risk
                riskScore += 3;
            }
        }

        // Deleting policies is higher risk
        if (item.Operation == ChangeOperation.Delete)
        {
            result.ImpactedUsersCount += 10; // Assume some users affected
            riskScore += 5;
        }

        return riskScore;
    }

    private int AnalyzeWorkflowChange(ChangeItem item, SimulationResultDto result)
    {
        var riskScore = 0;

        if (item.ProposedValueJson != null)
        {
            try
            {
                using var doc = JsonDocument.Parse(item.ProposedValueJson);
                var root = doc.RootElement;

                // Check for critical action types
                if (root.TryGetProperty("actions", out var actions) && actions.ValueKind == JsonValueKind.Array)
                {
                    foreach (var action in actions.EnumerateArray())
                    {
                        if (action.TryGetProperty("actionType", out var actionType))
                        {
                            var type = actionType.GetString()?.ToLowerInvariant();
                            if (type == "revokeaccess" || type == "disableuser" || type == "deleteuser")
                            {
                                riskScore += 5;
                                result.ImpactedUsersCount += 5;
                            }
                        }
                    }
                }

                // Check severity
                if (root.TryGetProperty("severity", out var severity))
                {
                    var sev = severity.GetString()?.ToLowerInvariant();
                    if (sev == "critical" || sev == "high")
                    {
                        riskScore += 3;
                    }
                }
            }
            catch (JsonException)
            {
                riskScore += 2;
            }
        }

        return riskScore;
    }

    private int AnalyzeTenantSettingChange(ChangeItem item, SimulationResultDto result)
    {
        var riskScore = 0;

        if (item.ProposedValueJson != null)
        {
            try
            {
                using var doc = JsonDocument.Parse(item.ProposedValueJson);
                var root = doc.RootElement;

                // Security-related settings
                if (root.TryGetProperty("passwordPolicy", out _))
                {
                    riskScore += 3;
                    result.ImpactedUsersCount += 100; // Affects all users
                }

                if (root.TryGetProperty("sessionTimeout", out var timeout))
                {
                    var minutes = timeout.GetInt32();
                    if (minutes > 480) // More than 8 hours
                    {
                        riskScore += 5;
                        result.Warnings.Add("Extended session timeout may increase security risk");
                    }
                }

                if (root.TryGetProperty("allowPublicSignup", out var signup) && signup.GetBoolean())
                {
                    riskScore += 8;
                    result.Warnings.Add("Enabling public signup requires careful review");
                }
            }
            catch (JsonException)
            {
                riskScore += 2;
            }
        }

        return riskScore;
    }

    private int AnalyzeFederationChange(ChangeItem item, SimulationResultDto result)
    {
        var riskScore = 3; // Federation changes are inherently impactful

        if (item.Operation == ChangeOperation.Delete || item.Operation == ChangeOperation.Disable)
        {
            result.ImpactedUsersCount += 50; // Federation typically affects many users
            riskScore += 10;
            result.Warnings.Add("Disabling federation provider will prevent affected users from signing in");
        }

        if (item.ProposedValueJson != null)
        {
            try
            {
                using var doc = JsonDocument.Parse(item.ProposedValueJson);
                var root = doc.RootElement;

                // Check for certificate changes
                if (root.TryGetProperty("certificate", out _) || root.TryGetProperty("signingKey", out _))
                {
                    riskScore += 5;
                    result.Warnings.Add("Certificate changes may cause temporary authentication failures");
                }
            }
            catch (JsonException)
            {
                riskScore += 2;
            }
        }

        return riskScore;
    }

    private int AnalyzeApplicationChange(ChangeItem item, SimulationResultDto result)
    {
        var riskScore = 0;

        if (item.Operation == ChangeOperation.Delete || item.Operation == ChangeOperation.Disable)
        {
            result.ImpactedUsersCount += 20; // Assume some users use the app
            riskScore += 5;
        }

        if (item.ProposedValueJson != null)
        {
            try
            {
                using var doc = JsonDocument.Parse(item.ProposedValueJson);
                var root = doc.RootElement;

                // Check for OAuth/OIDC configuration changes
                if (root.TryGetProperty("redirectUris", out _) || root.TryGetProperty("clientSecret", out _))
                {
                    riskScore += 3;
                }

                // Check for permission scope changes
                if (root.TryGetProperty("allowedScopes", out _))
                {
                    riskScore += 2;
                }
            }
            catch (JsonException)
            {
                riskScore += 1;
            }
        }

        return riskScore;
    }

    private int EstimateAffectedUsers(JsonElement root)
    {
        // Try to estimate from various properties
        if (root.TryGetProperty("userCount", out var count))
        {
            return count.GetInt32();
        }

        if (root.TryGetProperty("scope", out var scope))
        {
            var scopeStr = scope.GetString()?.ToLowerInvariant();
            return scopeStr switch
            {
                "all" or "global" => 1000,
                "department" => 100,
                "team" => 20,
                _ => 10
            };
        }

        if (root.TryGetProperty("userGroups", out var groups) && groups.ValueKind == JsonValueKind.Array)
        {
            return groups.GetArrayLength() * 50; // Estimate 50 users per group
        }

        if (root.TryGetProperty("users", out var users) && users.ValueKind == JsonValueKind.Array)
        {
            return users.GetArrayLength();
        }

        return 10; // Default estimate
    }

    private void AnalyzeCrossItemImpacts(ChangeSet changeSet, SimulationResultDto result, ref int riskScore)
    {
        // Check for potentially conflicting changes
        var policyCount = changeSet.Items.Count(i => i.TargetType == ChangeTargetType.Policy);
        var workflowCount = changeSet.Items.Count(i => i.TargetType == ChangeTargetType.AutomationWorkflow);

        if (policyCount > 3)
        {
            riskScore += 5;
            result.Warnings.Add($"Multiple policy changes ({policyCount}) in single change set increases complexity");
        }

        if (workflowCount > 2 && policyCount > 0)
        {
            riskScore += 3;
            result.Warnings.Add("Mixing policy and workflow changes may have unexpected interactions");
        }

        // Check for delete operations on multiple types
        var deleteCount = changeSet.Items.Count(i => i.Operation == ChangeOperation.Delete);
        if (deleteCount > 2)
        {
            riskScore += deleteCount * 2;
            result.Warnings.Add($"Multiple delete operations ({deleteCount}) should be reviewed carefully");
        }
    }

    private void GenerateWarnings(ChangeSet changeSet, SimulationResultDto result)
    {
        if (result.PrivilegedUsersAffectedCount > 0)
        {
            result.Warnings.Add($"{result.PrivilegedUsersAffectedCount} privileged users may be affected");
        }

        if (result.ImpactedUsersCount > 500)
        {
            result.Warnings.Add($"Large user impact ({result.ImpactedUsersCount} users) - consider phased rollout");
        }

        if (changeSet.Category == ChangeCategory.FederationConfig)
        {
            result.Warnings.Add("Federation changes may require coordination with external identity providers");
        }

        if (changeSet.Items.Any(i => i.Operation == ChangeOperation.Delete && i.TargetType == ChangeTargetType.Policy))
        {
            result.Warnings.Add("Deleting policies cannot be easily reversed - ensure backups exist");
        }
    }

    private void GenerateRecommendations(ChangeSet changeSet, SimulationResultDto result)
    {
        if (result.ImpactedUsersCount > 100)
        {
            result.Recommendations.Add("Consider applying changes during off-peak hours");
            result.Recommendations.Add("Notify affected users before applying changes");
        }

        if (result.PoliciesAffected.Count > 0)
        {
            result.Recommendations.Add("Test policy changes in a staging environment first");
        }

        if (result.PrivilegedUsersAffectedCount > 0)
        {
            result.Recommendations.Add("Ensure privileged users are aware of changes affecting their access");
        }

        if (changeSet.Items.Any(i => i.TargetType == ChangeTargetType.FederationProvider))
        {
            result.Recommendations.Add("Have a rollback plan ready for federation changes");
            result.Recommendations.Add("Verify federation provider connectivity after changes");
        }

        if (result.RiskDirection == "Increased")
        {
            result.Recommendations.Add("Consider additional review cycles for high-risk changes");
            result.Recommendations.Add("Document the business justification for these changes");
        }
    }
}
