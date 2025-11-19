using System.Text.Json;
using Microsoft.Extensions.Logging;
using Onesign.Modules.AdaptiveSecurity.Domain.Entities;
using Onesign.Modules.AdaptiveSecurity.Domain.Enums;
using Onesign.Modules.AdaptiveSecurity.Domain.Repositories;
using Onesign.Modules.AdaptiveSecurity.Domain.Services;

namespace Onesign.Modules.AdaptiveSecurity.Infrastructure.Services;

public class AdaptivePolicyEngine : IAdaptivePolicyEngine
{
    private readonly IAdaptivePolicyRepository _policyRepository;
    private readonly ISecuritySignalRepository _signalRepository;
    private readonly IUserSecurityContextRepository _contextRepository;
    private readonly IRiskCalculator _riskCalculator;
    private readonly ILogger<AdaptivePolicyEngine> _logger;

    public AdaptivePolicyEngine(
        IAdaptivePolicyRepository policyRepository,
        ISecuritySignalRepository signalRepository,
        IUserSecurityContextRepository contextRepository,
        IRiskCalculator riskCalculator,
        ILogger<AdaptivePolicyEngine> logger)
    {
        _policyRepository = policyRepository;
        _signalRepository = signalRepository;
        _contextRepository = contextRepository;
        _riskCalculator = riskCalculator;
        _logger = logger;
    }

    public async Task<AdaptiveDecision> EvaluateAsync(
        Guid tenantId,
        Guid userId,
        UserSecurityContext context,
        CancellationToken cancellationToken = default)
    {
        _logger.LogDebug("Evaluating adaptive policies for user {UserId} in tenant {TenantId}", userId, tenantId);

        // Get recent security signals for the user
        var signals = await _signalRepository.GetRecentSignalsAsync(tenantId, userId, TimeSpan.FromHours(24), cancellationToken);

        // Calculate current risk score
        var riskScore = await _riskCalculator.CalculateRiskAsync(tenantId, userId, signals, cancellationToken);
        var riskLevel = DetermineRiskLevel(riskScore);

        // Get applicable policies ordered by priority
        var policies = await _policyRepository.GetByTenantIdAsync(tenantId, cancellationToken);
        var applicablePolicies = policies
            .Where(p => p.IsEnabled && p.RiskThreshold <= riskLevel)
            .OrderBy(p => p.Priority)
            .ToList();

        var requiredActions = new List<AdaptiveActionType>();
        Guid? matchedPolicyId = null;
        var reasons = new List<string>();

        foreach (var policy in applicablePolicies)
        {
            if (EvaluatePolicyConditions(policy, context, signals))
            {
                matchedPolicyId = policy.Id;
                requiredActions.AddRange(policy.Actions);

                // Apply risk-based MFA enforcement
                if (policy.Actions.Contains(AdaptiveActionType.RequireMfa))
                {
                    reasons.Add("MFA required due to elevated risk");
                }

                // Apply session lifetime adjustment
                if (policy.Actions.Contains(AdaptiveActionType.ShortenSession))
                {
                    reasons.Add("Session lifetime reduced due to risk level");
                }

                // Check for login anomaly detection
                if (policy.Actions.Contains(AdaptiveActionType.BlockAccess))
                {
                    reasons.Add("Access blocked due to suspicious activity");
                }

                _logger.LogInformation("Policy {PolicyId} matched for user {UserId} with risk score {RiskScore}",
                    policy.Id, userId, riskScore);
                break;
            }
        }

        // Remove duplicate actions
        requiredActions = requiredActions.Distinct().ToList();

        var isAllowed = !requiredActions.Contains(AdaptiveActionType.BlockAccess);

        var decision = new AdaptiveDecision
        {
            IsAllowed = isAllowed,
            RiskLevel = riskLevel,
            RiskScore = riskScore,
            RequiredActions = requiredActions,
            Reason = reasons.Any() ? string.Join("; ", reasons) : null,
            MatchedPolicyId = matchedPolicyId
        };

        _logger.LogDebug("Adaptive decision for user {UserId}: Allowed={IsAllowed}, RiskScore={RiskScore}, Actions={Actions}",
            userId, isAllowed, riskScore, string.Join(",", requiredActions));

        return decision;
    }

    private static RiskLevel DetermineRiskLevel(int riskScore)
    {
        return riskScore switch
        {
            >= 85 => RiskLevel.Critical,
            >= 70 => RiskLevel.High,
            >= 50 => RiskLevel.Medium,
            >= 25 => RiskLevel.Low,
            _ => RiskLevel.None
        };
    }

    private bool EvaluatePolicyConditions(
        AdaptivePolicy policy,
        UserSecurityContext context,
        IReadOnlyList<SecuritySignal> signals)
    {
        try
        {
            var conditions = JsonSerializer.Deserialize<PolicyConditions>(policy.Conditions);
            if (conditions == null)
                return true;

            // Check time-based conditions
            if (conditions.TimeRanges?.Any() == true)
            {
                var currentTime = DateTime.UtcNow.TimeOfDay;
                var inTimeRange = conditions.TimeRanges.Any(r =>
                    currentTime >= r.Start && currentTime <= r.End);
                if (!inTimeRange)
                    return false;
            }

            // Check location-based conditions
            if (conditions.AllowedCountries?.Any() == true &&
                !string.IsNullOrEmpty(context.LastCountry))
            {
                if (!conditions.AllowedCountries.Contains(context.LastCountry))
                    return true; // Trigger policy for disallowed locations
            }

            // Check for specific signal types
            if (conditions.SignalTypes?.Any() == true)
            {
                var hasMatchingSignal = signals.Any(s =>
                    conditions.SignalTypes.Contains(s.SignalType.ToString()));
                if (!hasMatchingSignal)
                    return false;
            }

            // Check minimum failed attempts
            if (conditions.MinFailedAttempts.HasValue)
            {
                var failedLoginSignals = signals.Count(s =>
                    s.SignalType == SecuritySignalType.FailedLogin);
                if (failedLoginSignals < conditions.MinFailedAttempts.Value)
                    return false;
            }

            return true;
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "Failed to parse policy conditions for policy {PolicyId}", policy.Id);
            return true;
        }
    }

    private class PolicyConditions
    {
        public List<TimeRange>? TimeRanges { get; set; }
        public List<string>? AllowedCountries { get; set; }
        public List<string>? SignalTypes { get; set; }
        public int? MinFailedAttempts { get; set; }
    }

    private class TimeRange
    {
        public TimeSpan Start { get; set; }
        public TimeSpan End { get; set; }
    }
}
