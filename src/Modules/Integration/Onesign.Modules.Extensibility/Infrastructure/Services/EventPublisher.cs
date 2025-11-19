using System.Text.Json;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Extensibility.Domain.Entities;
using Onesign.Modules.Extensibility.Domain.Repositories;
using Onesign.Modules.Extensibility.Domain.Services;

namespace Onesign.Modules.Extensibility.Infrastructure.Services;

public class EventPublisher : IEventPublisher
{
    private readonly IWebhookSubscriptionRepository _subscriptionRepository;
    private readonly IWebhookDeliveryLogRepository _deliveryLogRepository;
    private readonly ILogger<EventPublisher> _logger;

    private static readonly List<string> SupportedEventTypes = new()
    {
        "user.created",
        "user.updated",
        "user.deleted",
        "user.login.success",
        "user.login.failed",
        "user.password.changed",
        "user.mfa.enabled",
        "user.mfa.disabled",
        "group.created",
        "group.updated",
        "group.deleted",
        "group.member.added",
        "group.member.removed",
        "application.created",
        "application.updated",
        "application.deleted",
        "role.created",
        "role.updated",
        "role.deleted",
        "role.assigned",
        "role.unassigned",
        "policy.created",
        "policy.updated",
        "policy.deleted",
        "access.request.created",
        "access.request.approved",
        "access.request.rejected",
        "audit.event.created",
        "tenant.settings.updated"
    };

    public EventPublisher(
        IWebhookSubscriptionRepository subscriptionRepository,
        IWebhookDeliveryLogRepository deliveryLogRepository,
        ILogger<EventPublisher> logger)
    {
        _subscriptionRepository = subscriptionRepository;
        _deliveryLogRepository = deliveryLogRepository;
        _logger = logger;
    }

    public Task PublishAsync(
        Guid tenantId,
        string eventType,
        object payload,
        CancellationToken cancellationToken = default)
    {
        return PublishAsync(tenantId, eventType, payload, null, cancellationToken);
    }

    public async Task PublishAsync(
        Guid tenantId,
        string eventType,
        object payload,
        Guid? correlationId,
        CancellationToken cancellationToken = default)
    {
        _logger.LogDebug("Publishing event {EventType} for tenant {TenantId}", eventType, tenantId);

        // Find subscriptions that match this event type
        var subscriptions = await _subscriptionRepository.GetByTenantIdAsync(tenantId, cancellationToken);
        var matchingSubscriptions = subscriptions
            .Where(s => s.IsEnabled && MatchesEventType(s.EventTypesJson, eventType))
            .ToList();

        if (!matchingSubscriptions.Any())
        {
            _logger.LogDebug("No matching subscriptions found for event {EventType}", eventType);
            return;
        }

        // Create delivery logs for each subscription
        foreach (var subscription in matchingSubscriptions)
        {
            var deliveryLog = new WebhookDeliveryLog
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                SubscriptionId = subscription.Id,
                EventType = eventType,
                PayloadJson = JsonSerializer.Serialize(new
                {
                    EventType = eventType,
                    TenantId = tenantId,
                    Timestamp = DateTime.UtcNow,
                    CorrelationId = correlationId ?? Guid.NewGuid(),
                    Data = payload
                }),
                Status = Domain.Enums.WebhookDeliveryStatus.Pending,
                AttemptCount = 0,
                CreatedAt = DateTime.UtcNow
            };

            await _deliveryLogRepository.AddAsync(deliveryLog, cancellationToken);

            _logger.LogDebug("Created delivery log {DeliveryId} for subscription {SubscriptionId}",
                deliveryLog.Id, subscription.Id);
        }

        _logger.LogInformation("Queued {Count} webhook deliveries for event {EventType} in tenant {TenantId}",
            matchingSubscriptions.Count, eventType, tenantId);
    }

    public Task<IReadOnlyList<string>> GetSupportedEventTypesAsync(CancellationToken cancellationToken = default)
    {
        return Task.FromResult<IReadOnlyList<string>>(SupportedEventTypes);
    }

    private static bool MatchesEventType(string eventTypesJson, string eventType)
    {
        try
        {
            var eventTypes = JsonSerializer.Deserialize<List<string>>(eventTypesJson);
            if (eventTypes == null || !eventTypes.Any())
                return false;

            // Support wildcard matching
            foreach (var pattern in eventTypes)
            {
                if (pattern == "*")
                    return true;

                if (pattern.EndsWith(".*"))
                {
                    var prefix = pattern[..^2];
                    if (eventType.StartsWith(prefix))
                        return true;
                }
                else if (pattern == eventType)
                {
                    return true;
                }
            }

            return false;
        }
        catch
        {
            return false;
        }
    }
}
