using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Authorization.Domain.Enums;
using Onesign.Modules.Authorization.Domain.Repositories;
using Onesign.Modules.Authorization.Domain.Services;
using Onesign.Modules.Tenants.Domain.Entities;
using Onesign.Modules.Identity.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Authorization.Application.Services;

public class PolicyEvaluationService : IPolicyEvaluationService
{
    private readonly IPolicyAssignmentRepository _assignmentRepository;
    private readonly DbContext _dbContext;

    public PolicyEvaluationService(
        IPolicyAssignmentRepository assignmentRepository,
        DbContext dbContext)
    {
        _assignmentRepository = assignmentRepository;
        _dbContext = dbContext;
    }

    public async Task<PolicyEvaluationResult> EvaluateAsync(
        Guid tenantId,
        Guid userId,
        Guid? clientId,
        string targetKey,
        PolicyTargetType targetType,
        Dictionary<string, object>? context = null,
        CancellationToken cancellationToken = default)
    {
        var result = new PolicyEvaluationResult { IsAllowed = true };

        // Get policy assignments for this target
        var assignments = await _assignmentRepository.GetByTargetAsync(tenantId, targetKey, targetType, cancellationToken);

        if (!assignments.Any())
        {
            // No policies assigned - default allow
            return result;
        }

        // Get user context
        var userContext = await BuildUserContextAsync(tenantId, userId, clientId, cancellationToken);

        // Merge with provided context
        if (context != null)
        {
            foreach (var kvp in context)
            {
                userContext[kvp.Key] = kvp.Value;
            }
        }

        // Evaluate policies in order
        foreach (var assignment in assignments.OrderBy(a => a.Order))
        {
            var policy = assignment.PolicyDefinition;
            if (policy == null || !policy.Enabled)
                continue;

            // Evaluate all condition groups (OR between groups)
            bool policyMatches = false;

            if (!policy.ConditionGroups.Any())
            {
                // No conditions - policy always matches
                policyMatches = true;
            }
            else
            {
                foreach (var group in policy.ConditionGroups)
                {
                    bool groupMatches = EvaluateConditionGroup(group, userContext);
                    if (groupMatches)
                    {
                        policyMatches = true;
                        break; // OR logic - one group matching is enough
                    }
                }
            }

            if (policyMatches)
            {
                result.MatchedPolicies.Add(policy.Name);

                if (policy.Effect == PolicyEffect.Deny)
                {
                    result.IsAllowed = false;
                    result.DenyReason = $"Access denied by policy: {policy.Name}";
                    result.DeniedScopes.Add(targetKey);
                    return result; // Deny takes precedence - stop evaluation
                }
                else if (policy.Effect == PolicyEffect.Allow)
                {
                    result.AllowedScopes.Add(targetKey);
                }
            }
        }

        return result;
    }

    private bool EvaluateConditionGroup(Domain.Entities.PolicyConditionGroup group, Dictionary<string, object> context)
    {
        if (!group.Conditions.Any())
            return true;

        var results = new List<bool>();

        foreach (var condition in group.Conditions)
        {
            bool conditionResult = EvaluateCondition(condition, context);
            results.Add(conditionResult);
        }

        // Apply logical operator
        if (group.LogicalOperator == ConditionLogicalOperator.And)
        {
            return results.All(r => r);
        }
        else // OR
        {
            return results.Any(r => r);
        }
    }

    private bool EvaluateCondition(Domain.Entities.PolicyCondition condition, Dictionary<string, object> context)
    {
        // Get the value from context based on source type
        if (!context.TryGetValue(condition.SourceKey, out var actualValue))
        {
            // Key not found in context - condition fails
            return false;
        }

        var actualValueStr = actualValue?.ToString() ?? string.Empty;
        var expectedValue = condition.Value;

        return condition.Operator switch
        {
            ConditionOperator.Equals => string.Equals(actualValueStr, expectedValue, StringComparison.OrdinalIgnoreCase),
            ConditionOperator.NotEquals => !string.Equals(actualValueStr, expectedValue, StringComparison.OrdinalIgnoreCase),
            ConditionOperator.Contains => actualValueStr.Contains(expectedValue, StringComparison.OrdinalIgnoreCase),
            ConditionOperator.NotContains => !actualValueStr.Contains(expectedValue, StringComparison.OrdinalIgnoreCase),
            ConditionOperator.StartsWith => actualValueStr.StartsWith(expectedValue, StringComparison.OrdinalIgnoreCase),
            ConditionOperator.EndsWith => actualValueStr.EndsWith(expectedValue, StringComparison.OrdinalIgnoreCase),
            ConditionOperator.GreaterThan => CompareNumeric(actualValueStr, expectedValue) > 0,
            ConditionOperator.LessThan => CompareNumeric(actualValueStr, expectedValue) < 0,
            ConditionOperator.GreaterThanOrEqual => CompareNumeric(actualValueStr, expectedValue) >= 0,
            ConditionOperator.LessThanOrEqual => CompareNumeric(actualValueStr, expectedValue) <= 0,
            ConditionOperator.In => IsInList(actualValueStr, expectedValue),
            ConditionOperator.NotIn => !IsInList(actualValueStr, expectedValue),
            _ => false
        };
    }

    private async Task<Dictionary<string, object>> BuildUserContextAsync(
        Guid tenantId,
        Guid userId,
        Guid? clientId,
        CancellationToken cancellationToken)
    {
        var context = new Dictionary<string, object>();

        // Get user information
        var tenantUser = await _dbContext.Set<TenantUserEntity>()
            .FirstOrDefaultAsync(x => x.Id == userId && x.TenantId == tenantId, cancellationToken);

        if (tenantUser != null)
        {
            context["UserId"] = tenantUser.Id.ToString();
            context["IsActive"] = tenantUser.IsActive;
            
            // Get global user for email information
            var globalUser = await _dbContext.Set<GlobalUserEntity>()
                .FirstOrDefaultAsync(x => x.Id == tenantUser.GlobalUserId, cancellationToken);
            
            if (globalUser != null)
            {
                context["Email"] = globalUser.Email;
                context["EmailVerified"] = globalUser.EmailVerified;
            }
        }

        // Get user roles (you would need to implement this based on your role system)
        // For now, placeholder
        context["Roles"] = new List<string>();

        // Get organization/unit information
        // Placeholder - implement based on your org structure
        context["OrgUnit"] = string.Empty;

        // Add client ID if present
        if (clientId.HasValue)
        {
            context["ClientId"] = clientId.Value.ToString();
        }

        // Add current time context
        context["CurrentTime"] = DateTime.UtcNow;
        context["CurrentHour"] = DateTime.UtcNow.Hour;
        context["CurrentDayOfWeek"] = DateTime.UtcNow.DayOfWeek.ToString();

        return context;
    }

    private static int CompareNumeric(string actual, string expected)
    {
        if (double.TryParse(actual, out var actualNum) && double.TryParse(expected, out var expectedNum))
        {
            return actualNum.CompareTo(expectedNum);
        }
        return string.Compare(actual, expected, StringComparison.Ordinal);
    }

    private static bool IsInList(string actual, string expected)
    {
        // Expected value should be comma-separated list
        var list = expected.Split(',', StringSplitOptions.RemoveEmptyEntries)
            .Select(x => x.Trim());
        return list.Any(item => string.Equals(item, actual, StringComparison.OrdinalIgnoreCase));
    }
}
