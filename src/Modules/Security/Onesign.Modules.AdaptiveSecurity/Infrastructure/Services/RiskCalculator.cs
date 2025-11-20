using Microsoft.Extensions.Logging;
using Onesign.Modules.AdaptiveSecurity.Domain.Entities;
using Onesign.Modules.AdaptiveSecurity.Domain.Enums;
using Onesign.Modules.AdaptiveSecurity.Domain.Services;

namespace Onesign.Modules.AdaptiveSecurity.Infrastructure.Services;

public class RiskCalculator : IRiskCalculator
{
    private readonly ILogger<RiskCalculator> _logger;

    public RiskCalculator(ILogger<RiskCalculator> logger)
    {
        _logger = logger;
    }

    public Task<int> CalculateRiskAsync(
        Guid tenantId,
        Guid userId,
        IReadOnlyList<SecuritySignal> signals,
        CancellationToken cancellationToken = default)
    {
        var riskScore = 0;

        // Calculate risk based on signal types and their scores
        foreach (var signal in signals)
        {
            var signalWeight = GetSignalWeight(signal.SignalType);
            var ageDecay = CalculateAgeDecay(signal.DetectedAt);
            var contribution = (int)(signal.RiskScore * signalWeight * ageDecay);
            riskScore += contribution;
        }

        // Apply pattern-based adjustments
        riskScore += CalculatePatternRisk(signals);

        // Cap at 100
        riskScore = Math.Min(riskScore, 100);

        _logger.LogDebug("Calculated risk score {RiskScore} for user {UserId} based on {SignalCount} signals",
            riskScore, userId, signals.Count);

        return Task.FromResult(riskScore);
    }

    private static double GetSignalWeight(SecuritySignalType signalType)
    {
        return signalType switch
        {
            SecuritySignalType.GeoAnomaly => 1.5, // Maps to ImpossibleTravel
            SecuritySignalType.BehaviorAnomaly => 1.3, // Maps to SuspiciousActivity
            SecuritySignalType.ThreatIntelligence => 1.2, // Maps to PrivilegeEscalation
            SecuritySignalType.LoginAnomaly => 0.5, // Maps to FailedLogin
            SecuritySignalType.DeviceAnomaly => 0.3, // Maps to NewDevice
            SecuritySignalType.AnomalyDetected => 0.1, // Maps to SuccessfulLogin (low risk)
            _ => 1.0
        };
    }

    private static double CalculateAgeDecay(DateTime detectedAt)
    {
        var age = DateTime.UtcNow - detectedAt;

        // Full weight for first hour
        if (age.TotalHours < 1)
            return 1.0;

        // Decay over 24 hours
        if (age.TotalHours < 24)
            return 1.0 - (age.TotalHours / 48);

        // Minimum weight for older signals
        return 0.5;
    }

    private static int CalculatePatternRisk(IReadOnlyList<SecuritySignal> signals)
    {
        var patternRisk = 0;

        // Multiple failed logins in short period
        var recentFailedLogins = signals
            .Where(s => s.SignalType == SecuritySignalType.LoginAnomaly &&
                       s.DetectedAt > DateTime.UtcNow.AddHours(-1))
            .Count();

        if (recentFailedLogins >= 5)
            patternRisk += 30;
        else if (recentFailedLogins >= 3)
            patternRisk += 15;

        // Impossible travel detected
        if (signals.Any(s => s.SignalType == SecuritySignalType.GeoAnomaly &&
                            s.DetectedAt > DateTime.UtcNow.AddHours(-24)))
        {
            patternRisk += 25;
        }

        // Multiple new devices in short period
        var newDevices = signals
            .Where(s => s.SignalType == SecuritySignalType.DeviceAnomaly &&
                       s.DetectedAt > DateTime.UtcNow.AddDays(-7))
            .Count();

        if (newDevices >= 3)
            patternRisk += 20;

        // MFA disabled recently (BehaviorAnomaly)
        if (signals.Any(s => s.SignalType == SecuritySignalType.BehaviorAnomaly &&
                            s.DetectedAt > DateTime.UtcNow.AddDays(-1)))
        {
            patternRisk += 15;
        }

        return patternRisk;
    }
}
