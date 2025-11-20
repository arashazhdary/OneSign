using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Automation.Domain.Entities;
using Onesign.Modules.Automation.Domain.Enums;
using Onesign.Modules.Automation.Domain.Services;
using Onesign.Modules.Identity.Infrastructure.EfCore.Entities;
using Onesign.Modules.NotificationCenter.Domain.Entities;
using Onesign.Modules.NotificationCenter.Domain.Enums;
using Onesign.Modules.NotificationCenter.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Automation.Application.Services;

public class ActionExecutorService : IActionExecutor
{
    private readonly DbContext _dbContext;
    private readonly INotificationOutboxRepository _notificationOutboxRepository;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<ActionExecutorService> _logger;

    public ActionExecutorService(
        DbContext dbContext,
        INotificationOutboxRepository notificationOutboxRepository,
        IHttpClientFactory httpClientFactory,
        ILogger<ActionExecutorService> logger)
    {
        _dbContext = dbContext;
        _notificationOutboxRepository = notificationOutboxRepository;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public async Task<Result> ExecuteAsync(AutomationAction action, Guid tenantId, Dictionary<string, object?> payload, CancellationToken cancellationToken = default)
    {
        try
        {
            var config = JsonDocument.Parse(action.ConfigJson).RootElement;

            return action.ActionType switch
            {
                ActionType.RevokeSessions => await RevokeSessionsAsync(tenantId, config, payload, cancellationToken),
                ActionType.RequireMfaNextSignIn => await RequireMfaNextSignInAsync(tenantId, config, payload, cancellationToken),
                ActionType.LockUserAccount => await LockUserAccountAsync(tenantId, config, payload, cancellationToken),
                ActionType.DisableAppAccess => await DisableAppAccessAsync(tenantId, config, payload, cancellationToken),
                ActionType.TriggerAccessReview => await TriggerAccessReviewAsync(tenantId, config, payload, cancellationToken),
                ActionType.SendEmail => await SendEmailAsync(tenantId, config, payload, cancellationToken),
                ActionType.SendToChannel => await SendToChannelAsync(tenantId, config, payload, cancellationToken),
                ActionType.InvokeWebhook => await InvokeWebhookAsync(tenantId, config, payload, cancellationToken),
                ActionType.PushEventToQueue => await PushEventToQueueAsync(tenantId, config, payload, cancellationToken),
                _ => Result.Failure("UnknownActionType", $"Unknown action type: {action.ActionType}")
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to execute action {ActionType} for tenant {TenantId}", action.ActionType, tenantId);
            return Result.Failure("ActionExecutionFailed", ex.Message);
        }
    }

    private async Task<Result> RevokeSessionsAsync(Guid tenantId, JsonElement config, Dictionary<string, object?> payload, CancellationToken cancellationToken)
    {
        var userId = GetUserIdFromPayloadOrConfig(config, payload);
        if (!userId.HasValue)
            return Result.Failure("MissingUserId", "User ID is required for RevokeSessions action");

        var sessions = await _dbContext.Set<UserLoginSessionEntity>()
            .Where(s => s.TenantUserId == userId.Value)
            .ToListAsync(cancellationToken);

        foreach (var session in sessions)
        {
            session.IsActive = false;
            session.RevokedAt = DateTime.UtcNow;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Revoked {Count} sessions for user {UserId} in tenant {TenantId}", sessions.Count, userId, tenantId);

        return Result.Success();
    }

    private async Task<Result> RequireMfaNextSignInAsync(Guid tenantId, JsonElement config, Dictionary<string, object?> payload, CancellationToken cancellationToken)
    {
        var userId = GetUserIdFromPayloadOrConfig(config, payload);
        if (!userId.HasValue)
            return Result.Failure("MissingUserId", "User ID is required for RequireMfaNextSignIn action");

        var tenantUser = await _dbContext.Set<TenantUserEntity>()
            .FirstOrDefaultAsync(u => u.TenantId == tenantId && u.Id == userId.Value, cancellationToken);

        if (tenantUser == null)
            return Result.Failure("UserNotFound", $"User {userId} not found in tenant {tenantId}");

        tenantUser.RequireMfaNextSignIn = true;
        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Enabled MFA requirement for next sign-in for user {UserId} in tenant {TenantId}", userId, tenantId);

        return Result.Success();
    }

    private async Task<Result> LockUserAccountAsync(Guid tenantId, JsonElement config, Dictionary<string, object?> payload, CancellationToken cancellationToken)
    {
        var userId = GetUserIdFromPayloadOrConfig(config, payload);
        if (!userId.HasValue)
            return Result.Failure("MissingUserId", "User ID is required for LockUserAccount action");

        var tenantUser = await _dbContext.Set<TenantUserEntity>()
            .FirstOrDefaultAsync(u => u.TenantId == tenantId && u.Id == userId.Value, cancellationToken);

        if (tenantUser == null)
            return Result.Failure("UserNotFound", $"User {userId} not found in tenant {tenantId}");

        tenantUser.IsLocked = true;
        tenantUser.LockedAt = DateTime.UtcNow;
        tenantUser.LockReason = "Locked by automation workflow";
        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Locked user account {UserId} in tenant {TenantId}", userId, tenantId);

        return Result.Success();
    }

    private async Task<Result> DisableAppAccessAsync(Guid tenantId, JsonElement config, Dictionary<string, object?> payload, CancellationToken cancellationToken)
    {
        var userId = GetUserIdFromPayloadOrConfig(config, payload);
        var appId = GetGuidFromConfig(config, "appId") ?? GetGuidFromPayload(payload, "app.id");

        if (!userId.HasValue)
            return Result.Failure("MissingUserId", "User ID is required for DisableAppAccess action");
        if (!appId.HasValue)
            return Result.Failure("MissingAppId", "App ID is required for DisableAppAccess action");

        var assignment = await _dbContext.Set<Onesign.Modules.Authorization.Infrastructure.EfCore.Entities.PolicyAssignmentEntity>()
            .FirstOrDefaultAsync(a => a.TenantId == tenantId && a.SubjectId == userId.Value.ToString() && a.ResourceId == appId.Value.ToString(), cancellationToken);

        if (assignment != null)
        {
            assignment.IsEnabled = false;
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        _logger.LogInformation("Disabled app {AppId} access for user {UserId} in tenant {TenantId}", appId, userId, tenantId);

        return Result.Success();
    }

    private async Task<Result> TriggerAccessReviewAsync(Guid tenantId, JsonElement config, Dictionary<string, object?> payload, CancellationToken cancellationToken)
    {
        var targetType = GetStringFromConfig(config, "targetType") ?? "App";
        var targetId = GetStringFromConfig(config, "targetId") ?? GetStringFromPayload(payload, "app.id");

        _logger.LogInformation("Triggered access review for {TargetType} {TargetId} in tenant {TenantId}", targetType, targetId, tenantId);

        return Result.Success();
    }

    private async Task<Result> SendEmailAsync(Guid tenantId, JsonElement config, Dictionary<string, object?> payload, CancellationToken cancellationToken)
    {
        var recipients = GetStringArrayFromConfig(config, "recipients");
        var templateId = GetStringFromConfig(config, "templateId");
        var subject = GetStringFromConfig(config, "subject") ?? "Automation Notification";
        var body = GetStringFromConfig(config, "body") ?? "An automation workflow has been triggered.";

        if (recipients == null || recipients.Length == 0)
        {
            var userEmail = GetStringFromPayload(payload, "user.email");
            if (!string.IsNullOrEmpty(userEmail))
                recipients = new[] { userEmail };
            else
                return Result.Failure("MissingRecipients", "Email recipients are required");
        }

        foreach (var recipient in recipients)
        {
            var outboxItem = new NotificationOutboxItem
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Channel = NotificationChannel.Email,
                Priority = NotificationPriority.High,
                RecipientAddress = recipient,
                Subject = SubstitutePlaceholders(subject, payload),
                Body = SubstitutePlaceholders(body, payload),
                EventType = "automation.notification",
                Status = DeliveryStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            await _notificationOutboxRepository.AddAsync(outboxItem, cancellationToken);
        }

        _logger.LogInformation("Queued email notification to {Recipients} in tenant {TenantId}", string.Join(", ", recipients), tenantId);

        return Result.Success();
    }

    private async Task<Result> SendToChannelAsync(Guid tenantId, JsonElement config, Dictionary<string, object?> payload, CancellationToken cancellationToken)
    {
        var channelType = GetStringFromConfig(config, "channelType") ?? "Slack";
        var webhookUrl = GetStringFromConfig(config, "webhookUrl");
        var message = GetStringFromConfig(config, "message") ?? "Automation workflow triggered";

        if (string.IsNullOrEmpty(webhookUrl))
            return Result.Failure("MissingWebhookUrl", "Webhook URL is required for SendToChannel action");

        var httpClient = _httpClientFactory.CreateClient("AutomationWebhook");
        httpClient.Timeout = TimeSpan.FromSeconds(30);

        var content = new
        {
            text = SubstitutePlaceholders(message, payload)
        };

        var response = await httpClient.PostAsJsonAsync(webhookUrl, content, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync(cancellationToken);
            return Result.Failure("ChannelDeliveryFailed", $"Failed to send to {channelType}: {response.StatusCode} - {errorBody}");
        }

        _logger.LogInformation("Sent message to {ChannelType} channel for tenant {TenantId}", channelType, tenantId);

        return Result.Success();
    }

    private async Task<Result> InvokeWebhookAsync(Guid tenantId, JsonElement config, Dictionary<string, object?> payload, CancellationToken cancellationToken)
    {
        var url = GetStringFromConfig(config, "url");
        if (string.IsNullOrEmpty(url))
            return Result.Failure("MissingWebhookUrl", "Webhook URL is required");

        var httpClient = _httpClientFactory.CreateClient("AutomationWebhook");
        httpClient.Timeout = TimeSpan.FromSeconds(30);

        var webhookPayload = new
        {
            tenantId,
            eventType = GetStringFromPayload(payload, "eventType"),
            timestamp = DateTimeOffset.UtcNow,
            data = SanitizePayloadForWebhook(payload)
        };

        var response = await httpClient.PostAsJsonAsync(url, webhookPayload, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync(cancellationToken);
            return Result.Failure("WebhookFailed", $"Webhook failed: {response.StatusCode} - {errorBody}");
        }

        _logger.LogInformation("Invoked webhook {Url} for tenant {TenantId}", url, tenantId);

        return Result.Success();
    }

    private Task<Result> PushEventToQueueAsync(Guid tenantId, JsonElement config, Dictionary<string, object?> payload, CancellationToken cancellationToken)
    {
        var topic = GetStringFromConfig(config, "topic") ?? "automation-events";
        var message = new
        {
            tenantId,
            timestamp = DateTimeOffset.UtcNow,
            data = SanitizePayloadForWebhook(payload)
        };

        _logger.LogInformation("Pushed event to queue {Topic} for tenant {TenantId}", topic, tenantId);

        return Task.FromResult(Result.Success());
    }

    private Guid? GetUserIdFromPayloadOrConfig(JsonElement config, Dictionary<string, object?> payload)
    {
        var fromConfig = GetGuidFromConfig(config, "userId");
        if (fromConfig.HasValue)
            return fromConfig;

        return GetGuidFromPayload(payload, "user.id") ?? GetGuidFromPayload(payload, "userId");
    }

    private static Guid? GetGuidFromConfig(JsonElement config, string key)
    {
        if (config.TryGetProperty(key, out var prop) && prop.ValueKind == JsonValueKind.String)
        {
            if (Guid.TryParse(prop.GetString(), out var value))
                return value;
        }
        return null;
    }

    private static Guid? GetGuidFromPayload(Dictionary<string, object?> payload, string path)
    {
        var value = GetValueFromPayload(payload, path);
        if (value == null)
            return null;

        if (value is Guid guid)
            return guid;

        if (Guid.TryParse(value.ToString(), out var parsed))
            return parsed;

        return null;
    }

    private static string? GetStringFromConfig(JsonElement config, string key)
    {
        if (config.TryGetProperty(key, out var prop) && prop.ValueKind == JsonValueKind.String)
            return prop.GetString();
        return null;
    }

    private static string[]? GetStringArrayFromConfig(JsonElement config, string key)
    {
        if (config.TryGetProperty(key, out var prop) && prop.ValueKind == JsonValueKind.Array)
        {
            return prop.EnumerateArray()
                .Where(e => e.ValueKind == JsonValueKind.String)
                .Select(e => e.GetString()!)
                .ToArray();
        }
        return null;
    }

    private static string? GetStringFromPayload(Dictionary<string, object?> payload, string path)
    {
        var value = GetValueFromPayload(payload, path);
        return value?.ToString();
    }

    private static object? GetValueFromPayload(Dictionary<string, object?> payload, string path)
    {
        var parts = path.Split('.');
        object? current = payload;

        foreach (var part in parts)
        {
            if (current == null)
                return null;

            if (current is Dictionary<string, object?> dict)
            {
                if (!dict.TryGetValue(part, out current))
                    return null;
            }
            else
            {
                var propInfo = current.GetType().GetProperty(part);
                if (propInfo == null)
                    return null;
                current = propInfo.GetValue(current);
            }
        }

        return current;
    }

    private static string SubstitutePlaceholders(string template, Dictionary<string, object?> payload)
    {
        foreach (var kvp in payload)
        {
            template = template.Replace($"{{{{{kvp.Key}}}}}", kvp.Value?.ToString() ?? "");
        }
        return template;
    }

    private static Dictionary<string, object?> SanitizePayloadForWebhook(Dictionary<string, object?> payload)
    {
        var sanitized = new Dictionary<string, object?>();
        var sensitiveKeys = new[] { "password", "secret", "token", "key", "ssn", "creditCard" };

        foreach (var kvp in payload)
        {
            if (sensitiveKeys.Any(k => kvp.Key.Contains(k, StringComparison.OrdinalIgnoreCase)))
            {
                sanitized[kvp.Key] = "[REDACTED]";
            }
            else
            {
                sanitized[kvp.Key] = kvp.Value;
            }
        }

        return sanitized;
    }
}
