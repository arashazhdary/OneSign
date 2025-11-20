using Microsoft.Extensions.Logging;
using Onesign.Modules.AdaptiveSecurity.Domain.Entities;
using Onesign.Modules.AdaptiveSecurity.Domain.Enums;
using Onesign.Modules.AdaptiveSecurity.Domain.Repositories;
using Onesign.Modules.AdaptiveSecurity.Domain.Services;

namespace Onesign.Modules.AdaptiveSecurity.Infrastructure.Services;

public class RiskBasedAuthenticationService : IRiskBasedAuthenticationService
{
    private readonly IAdaptivePolicyEngine _policyEngine;
    private readonly IUserSecurityContextRepository _contextRepository;
    private readonly ISecuritySignalRepository _signalRepository;
    private readonly IRiskCalculator _riskCalculator;
    private readonly ILogger<RiskBasedAuthenticationService> _logger;

    private const int DefaultSessionLifetimeMinutes = 480; // 8 hours
    private const int ReducedSessionLifetimeMinutes = 60; // 1 hour
    private const int MinimalSessionLifetimeMinutes = 15;

    public RiskBasedAuthenticationService(
        IAdaptivePolicyEngine policyEngine,
        IUserSecurityContextRepository contextRepository,
        ISecuritySignalRepository signalRepository,
        IRiskCalculator riskCalculator,
        ILogger<RiskBasedAuthenticationService> logger)
    {
        _policyEngine = policyEngine;
        _contextRepository = contextRepository;
        _signalRepository = signalRepository;
        _riskCalculator = riskCalculator;
        _logger = logger;
    }

    public async Task<AdaptiveDecision> EvaluateAuthenticationAsync(
        Guid tenantId,
        Guid userId,
        AuthenticationContext authContext,
        CancellationToken cancellationToken = default)
    {
        _logger.LogDebug("Evaluating authentication for user {UserId} in tenant {TenantId}", userId, tenantId);

        var context = await _contextRepository.GetByUserIdAsync(tenantId, userId, cancellationToken);
        if (context == null)
        {
            context = new UserSecurityContext
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                UserId = userId,
                CurrentRiskScore = 0,
                RiskLevel = RiskLevel.None,
                LastEvaluatedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };
            await _contextRepository.AddAsync(context, cancellationToken);
        }

        // Generate signals based on authentication context
        await GenerateContextSignalsAsync(tenantId, userId, authContext, context, cancellationToken);

        // Get decision from policy engine
        var decision = await _policyEngine.EvaluateAsync(tenantId, userId, context, cancellationToken);

        // Update context
        context.LastIpAddress = authContext.IpAddress;
        context.LastEvaluatedAt = DateTime.UtcNow;
        await _contextRepository.UpdateAsync(context, cancellationToken);

        return decision;
    }

    public async Task<bool> RequiresMfaAsync(
        Guid tenantId,
        Guid userId,
        int riskScore,
        CancellationToken cancellationToken = default)
    {
        // Always require MFA for high risk
        if (riskScore >= 70)
            return true;

        // Check context for MFA requirements
        var context = await _contextRepository.GetByUserIdAsync(tenantId, userId, cancellationToken);
        if (context == null)
            return riskScore >= 50;

        // Require MFA if new device or location
        if (context.IsNewDevice || !string.IsNullOrEmpty(context.LastCountry))
        {
            return riskScore >= 30;
        }

        return riskScore >= 50;
    }

    public Task<int> GetSessionLifetimeAsync(
        Guid tenantId,
        Guid userId,
        int riskScore,
        CancellationToken cancellationToken = default)
    {
        var lifetime = riskScore switch
        {
            >= 85 => MinimalSessionLifetimeMinutes,
            >= 70 => ReducedSessionLifetimeMinutes,
            >= 50 => ReducedSessionLifetimeMinutes * 2,
            >= 30 => DefaultSessionLifetimeMinutes / 2,
            _ => DefaultSessionLifetimeMinutes
        };

        _logger.LogDebug("Session lifetime for user {UserId} with risk {RiskScore}: {Lifetime} minutes",
            userId, riskScore, lifetime);

        return Task.FromResult(lifetime);
    }

    private async Task GenerateContextSignalsAsync(
        Guid tenantId,
        Guid userId,
        AuthenticationContext authContext,
        UserSecurityContext userContext,
        CancellationToken cancellationToken)
    {
        var signals = new List<SecuritySignal>();

        // New device signal
        if (authContext.IsNewDevice)
        {
            signals.Add(new SecuritySignal
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                UserId = userId,
                SignalType = SecuritySignalType.DeviceAnomaly,
                RiskScore = 15,
                DetailsJson = System.Text.Json.JsonSerializer.Serialize(new { authContext.DeviceId, authContext.UserAgent }),
                DetectedAt = DateTime.UtcNow
            });
        }

        // New location signal
        if (authContext.IsNewLocation)
        {
            signals.Add(new SecuritySignal
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                UserId = userId,
                SignalType = SecuritySignalType.GeoAnomaly,
                RiskScore = 20,
                DetailsJson = System.Text.Json.JsonSerializer.Serialize(new { authContext.GeoLocation, authContext.IpAddress }),
                DetectedAt = DateTime.UtcNow
            });
        }

        // Failed attempts signal
        if (authContext.FailedAttempts > 0)
        {
            var riskScore = authContext.FailedAttempts >= 5 ? 40 : authContext.FailedAttempts * 5;
            signals.Add(new SecuritySignal
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                UserId = userId,
                SignalType = SecuritySignalType.LoginAnomaly,
                RiskScore = riskScore,
                DetailsJson = System.Text.Json.JsonSerializer.Serialize(new { Count = authContext.FailedAttempts }),
                DetectedAt = DateTime.UtcNow
            });
        }

        // Impossible travel detection
        if (userContext.LastSuccessfulLoginAt.HasValue &&
            (DateTime.UtcNow - userContext.LastSuccessfulLoginAt.Value).TotalHours < 2 &&
            userContext.LastIpAddress != authContext.IpAddress &&
            authContext.IsNewLocation)
        {
            signals.Add(new SecuritySignal
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                UserId = userId,
                SignalType = SecuritySignalType.GeoAnomaly,
                RiskScore = 50,
                DetailsJson = System.Text.Json.JsonSerializer.Serialize(new
                {
                    PreviousIp = userContext.LastIpAddress,
                    CurrentIp = authContext.IpAddress,
                    TimeDifference = (DateTime.UtcNow - userContext.LastSuccessfulLoginAt.Value).TotalMinutes
                }),
                DetectedAt = DateTime.UtcNow
            });
        }

        foreach (var signal in signals)
        {
            await _signalRepository.AddAsync(signal, cancellationToken);
        }
    }
}
