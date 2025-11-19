using System.Text.Json;
using Microsoft.Extensions.Logging;
using Onesign.Modules.AdaptiveSecurity.Domain.Entities;
using Onesign.Modules.AdaptiveSecurity.Domain.Enums;
using Onesign.Modules.AdaptiveSecurity.Domain.Repositories;
using Onesign.Modules.AdaptiveSecurity.Domain.Services;

namespace Onesign.Modules.AdaptiveSecurity.Infrastructure.Services;

public class SecuritySignalProcessor : ISecuritySignalProcessor
{
    private readonly ISecuritySignalRepository _signalRepository;
    private readonly IUserSecurityContextRepository _contextRepository;
    private readonly IAdaptivePolicyEngine _policyEngine;
    private readonly ILogger<SecuritySignalProcessor> _logger;

    public SecuritySignalProcessor(
        ISecuritySignalRepository signalRepository,
        IUserSecurityContextRepository contextRepository,
        IAdaptivePolicyEngine policyEngine,
        ILogger<SecuritySignalProcessor> logger)
    {
        _signalRepository = signalRepository;
        _contextRepository = contextRepository;
        _policyEngine = policyEngine;
        _logger = logger;
    }

    public async Task ProcessSignalAsync(SecuritySignal signal, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Processing security signal {SignalId} of type {SignalType} for user {UserId}",
            signal.Id, signal.SignalType, signal.UserId);

        // Save the signal
        await _signalRepository.AddAsync(signal, cancellationToken);

        // Update user security context
        var context = await _contextRepository.GetByUserIdAsync(signal.TenantId, signal.UserId, cancellationToken);
        if (context == null)
        {
            context = new UserSecurityContext
            {
                Id = Guid.NewGuid(),
                TenantId = signal.TenantId,
                UserId = signal.UserId,
                CurrentRiskScore = 0,
                RiskLevel = RiskLevel.None,
                LastEvaluatedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };
            await _contextRepository.AddAsync(context, cancellationToken);
        }

        // Process signal based on type
        var actionTaken = await ProcessSignalByTypeAsync(signal, context, cancellationToken);

        // Update signal with action taken
        signal.ProcessedAt = DateTime.UtcNow;
        signal.ActionTaken = actionTaken;
        await _signalRepository.UpdateAsync(signal, cancellationToken);

        // Evaluate adaptive policies
        var decision = await _policyEngine.EvaluateAsync(signal.TenantId, signal.UserId, context, cancellationToken);

        // Update user security context with new risk level
        context.CurrentRiskScore = decision.RiskScore;
        context.RiskLevel = decision.RiskLevel;
        context.LastEvaluatedAt = DateTime.UtcNow;
        await _contextRepository.UpdateAsync(context, cancellationToken);

        _logger.LogInformation("Processed signal {SignalId} with action: {Action}, new risk score: {RiskScore}",
            signal.Id, actionTaken, decision.RiskScore);
    }

    private async Task<string> ProcessSignalByTypeAsync(
        SecuritySignal signal,
        UserSecurityContext context,
        CancellationToken cancellationToken)
    {
        return signal.SignalType switch
        {
            SecuritySignalType.FailedLogin => await ProcessFailedLoginAsync(signal, context, cancellationToken),
            SecuritySignalType.SuccessfulLogin => await ProcessSuccessfulLoginAsync(signal, context, cancellationToken),
            SecuritySignalType.NewDevice => await ProcessNewDeviceAsync(signal, context, cancellationToken),
            SecuritySignalType.NewLocation => await ProcessNewLocationAsync(signal, context, cancellationToken),
            SecuritySignalType.ImpossibleTravel => await ProcessImpossibleTravelAsync(signal, context, cancellationToken),
            SecuritySignalType.SuspiciousActivity => await ProcessSuspiciousActivityAsync(signal, context, cancellationToken),
            SecuritySignalType.PasswordChange => await ProcessPasswordChangeAsync(signal, context, cancellationToken),
            SecuritySignalType.MfaDisabled => await ProcessMfaDisabledAsync(signal, context, cancellationToken),
            SecuritySignalType.PrivilegeEscalation => await ProcessPrivilegeEscalationAsync(signal, context, cancellationToken),
            _ => "Logged"
        };
    }

    private Task<string> ProcessFailedLoginAsync(SecuritySignal signal, UserSecurityContext context, CancellationToken cancellationToken)
    {
        context.FailedLoginAttempts++;
        context.LastFailedLoginAt = signal.DetectedAt;

        if (context.FailedLoginAttempts >= 10)
            return Task.FromResult("Account flagged for review");
        if (context.FailedLoginAttempts >= 5)
            return Task.FromResult("Warning issued");

        return Task.FromResult("Logged");
    }

    private Task<string> ProcessSuccessfulLoginAsync(SecuritySignal signal, UserSecurityContext context, CancellationToken cancellationToken)
    {
        context.FailedLoginAttempts = 0;
        context.LastSuccessfulLoginAt = signal.DetectedAt;

        try
        {
            var details = JsonSerializer.Deserialize<LoginDetails>(signal.DetailsJson);
            if (details != null)
            {
                context.LastIpAddress = details.IpAddress;
                context.LastCountry = details.Country;
                context.LastDeviceId = details.DeviceId;
            }
        }
        catch
        {
            // Ignore deserialization errors
        }

        return Task.FromResult("Session established");
    }

    private Task<string> ProcessNewDeviceAsync(SecuritySignal signal, UserSecurityContext context, CancellationToken cancellationToken)
    {
        context.KnownDevicesCount++;
        return Task.FromResult("Device registered");
    }

    private Task<string> ProcessNewLocationAsync(SecuritySignal signal, UserSecurityContext context, CancellationToken cancellationToken)
    {
        try
        {
            var details = JsonSerializer.Deserialize<LocationDetails>(signal.DetailsJson);
            if (details != null)
            {
                context.LastCountry = details.Country;
            }
        }
        catch
        {
            // Ignore deserialization errors
        }

        return Task.FromResult("Location noted");
    }

    private Task<string> ProcessImpossibleTravelAsync(SecuritySignal signal, UserSecurityContext context, CancellationToken cancellationToken)
    {
        context.ImpossibleTravelDetected = true;
        return Task.FromResult("Travel anomaly flagged");
    }

    private Task<string> ProcessSuspiciousActivityAsync(SecuritySignal signal, UserSecurityContext context, CancellationToken cancellationToken)
    {
        return Task.FromResult("Activity logged for investigation");
    }

    private Task<string> ProcessPasswordChangeAsync(SecuritySignal signal, UserSecurityContext context, CancellationToken cancellationToken)
    {
        return Task.FromResult("Password change recorded");
    }

    private Task<string> ProcessMfaDisabledAsync(SecuritySignal signal, UserSecurityContext context, CancellationToken cancellationToken)
    {
        context.MfaEnabled = false;
        return Task.FromResult("MFA status updated");
    }

    private Task<string> ProcessPrivilegeEscalationAsync(SecuritySignal signal, UserSecurityContext context, CancellationToken cancellationToken)
    {
        return Task.FromResult("Privilege change logged");
    }

    private class LoginDetails
    {
        public string? IpAddress { get; set; }
        public string? Country { get; set; }
        public string? DeviceId { get; set; }
    }

    private class LocationDetails
    {
        public string? Country { get; set; }
        public string? City { get; set; }
    }
}
