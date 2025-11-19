using Microsoft.Extensions.Logging;
using Onesign.Modules.Automation.Domain.Services;

namespace Onesign.Modules.Automation.Application.Services;

/// <summary>
/// Service for triggering automation workflows from application events.
/// Inject this service where you need to fire automation events.
/// </summary>
public interface IAutomationTriggerService
{
    Task TriggerHighRiskSignInAsync(Guid tenantId, Guid userId, int riskScore, string country, string ipAddress, bool mfaEnabled, CancellationToken cancellationToken = default);
    Task TriggerSignInSucceededAsync(Guid tenantId, Guid userId, string ipAddress, string userAgent, CancellationToken cancellationToken = default);
    Task TriggerSignInFailedAsync(Guid tenantId, string email, string ipAddress, string reason, CancellationToken cancellationToken = default);
    Task TriggerLeaverDetectedAsync(Guid tenantId, Guid userId, string email, DateTimeOffset terminationDate, CancellationToken cancellationToken = default);
    Task TriggerBreakGlassUsedAsync(Guid tenantId, Guid userId, Guid accountId, string reason, CancellationToken cancellationToken = default);
    Task TriggerAccessRequestCreatedAsync(Guid tenantId, Guid requestId, Guid requesterId, string resourceType, CancellationToken cancellationToken = default);
    Task TriggerAccessRequestApprovedAsync(Guid tenantId, Guid requestId, Guid approverId, CancellationToken cancellationToken = default);
    Task TriggerTenantRiskScoreHighAsync(Guid tenantId, int riskScore, string[] riskFactors, CancellationToken cancellationToken = default);
}

public class AutomationTriggerService : IAutomationTriggerService
{
    private readonly IAutomationEngine _automationEngine;
    private readonly ILogger<AutomationTriggerService> _logger;

    public AutomationTriggerService(
        IAutomationEngine automationEngine,
        ILogger<AutomationTriggerService> logger)
    {
        _automationEngine = automationEngine;
        _logger = logger;
    }

    public async Task TriggerHighRiskSignInAsync(
        Guid tenantId, Guid userId, int riskScore, string country, string ipAddress, bool mfaEnabled,
        CancellationToken cancellationToken = default)
    {
        var payload = new Dictionary<string, object?>
        {
            ["tenantId"] = tenantId.ToString(),
            ["user"] = new Dictionary<string, object?>
            {
                ["id"] = userId.ToString(),
                ["mfaEnabled"] = mfaEnabled
            },
            ["riskScore"] = riskScore,
            ["location"] = new Dictionary<string, object?>
            {
                ["country"] = country,
                ["ipAddress"] = ipAddress
            }
        };

        var eventId = $"signin-{tenantId}-{userId}-{DateTimeOffset.UtcNow.Ticks}";

        _logger.LogInformation("Triggering high-risk sign-in automation for user {UserId} in tenant {TenantId} with risk score {RiskScore}",
            userId, tenantId, riskScore);

        await _automationEngine.HandleEventAsync("Auth.HighRiskSignInDetected", payload, eventId, cancellationToken);
    }

    public async Task TriggerSignInSucceededAsync(
        Guid tenantId, Guid userId, string ipAddress, string userAgent,
        CancellationToken cancellationToken = default)
    {
        var payload = new Dictionary<string, object?>
        {
            ["tenantId"] = tenantId.ToString(),
            ["user"] = new Dictionary<string, object?> { ["id"] = userId.ToString() },
            ["ipAddress"] = ipAddress,
            ["userAgent"] = userAgent
        };

        await _automationEngine.HandleEventAsync("Auth.SignInSucceeded", payload, null, cancellationToken);
    }

    public async Task TriggerSignInFailedAsync(
        Guid tenantId, string email, string ipAddress, string reason,
        CancellationToken cancellationToken = default)
    {
        var payload = new Dictionary<string, object?>
        {
            ["tenantId"] = tenantId.ToString(),
            ["email"] = email,
            ["ipAddress"] = ipAddress,
            ["reason"] = reason
        };

        await _automationEngine.HandleEventAsync("Auth.SignInFailed", payload, null, cancellationToken);
    }

    public async Task TriggerLeaverDetectedAsync(
        Guid tenantId, Guid userId, string email, DateTimeOffset terminationDate,
        CancellationToken cancellationToken = default)
    {
        var payload = new Dictionary<string, object?>
        {
            ["tenantId"] = tenantId.ToString(),
            ["user"] = new Dictionary<string, object?>
            {
                ["id"] = userId.ToString(),
                ["email"] = email
            },
            ["terminationDate"] = terminationDate.ToString("o")
        };

        var eventId = $"leaver-{tenantId}-{userId}";

        _logger.LogInformation("Triggering leaver detection automation for user {UserId} in tenant {TenantId}",
            userId, tenantId);

        await _automationEngine.HandleEventAsync("Lifecycle.LeaverDetected", payload, eventId, cancellationToken);
    }

    public async Task TriggerBreakGlassUsedAsync(
        Guid tenantId, Guid userId, Guid accountId, string reason,
        CancellationToken cancellationToken = default)
    {
        var payload = new Dictionary<string, object?>
        {
            ["tenantId"] = tenantId.ToString(),
            ["user"] = new Dictionary<string, object?> { ["id"] = userId.ToString() },
            ["accountId"] = accountId.ToString(),
            ["reason"] = reason
        };

        var eventId = $"breakglass-{accountId}-{DateTimeOffset.UtcNow.Ticks}";

        _logger.LogInformation("Triggering break-glass automation for account {AccountId} in tenant {TenantId}",
            accountId, tenantId);

        await _automationEngine.HandleEventAsync("PrivilegedAccess.BreakGlassUsed", payload, eventId, cancellationToken);
    }

    public async Task TriggerAccessRequestCreatedAsync(
        Guid tenantId, Guid requestId, Guid requesterId, string resourceType,
        CancellationToken cancellationToken = default)
    {
        var payload = new Dictionary<string, object?>
        {
            ["tenantId"] = tenantId.ToString(),
            ["requestId"] = requestId.ToString(),
            ["requesterId"] = requesterId.ToString(),
            ["resourceType"] = resourceType
        };

        await _automationEngine.HandleEventAsync("AccessRequest.Created", payload, requestId.ToString(), cancellationToken);
    }

    public async Task TriggerAccessRequestApprovedAsync(
        Guid tenantId, Guid requestId, Guid approverId,
        CancellationToken cancellationToken = default)
    {
        var payload = new Dictionary<string, object?>
        {
            ["tenantId"] = tenantId.ToString(),
            ["requestId"] = requestId.ToString(),
            ["approverId"] = approverId.ToString()
        };

        await _automationEngine.HandleEventAsync("AccessRequest.Approved", payload, $"approved-{requestId}", cancellationToken);
    }

    public async Task TriggerTenantRiskScoreHighAsync(
        Guid tenantId, int riskScore, string[] riskFactors,
        CancellationToken cancellationToken = default)
    {
        var payload = new Dictionary<string, object?>
        {
            ["tenantId"] = tenantId.ToString(),
            ["riskScore"] = riskScore,
            ["riskFactors"] = riskFactors
        };

        var eventId = $"tenantrisk-{tenantId}-{DateTimeOffset.UtcNow.Date:yyyyMMdd}";

        _logger.LogInformation("Triggering tenant risk score automation for tenant {TenantId} with score {RiskScore}",
            tenantId, riskScore);

        await _automationEngine.HandleEventAsync("Insights.TenantRiskScoreHigh", payload, eventId, cancellationToken);
    }
}
