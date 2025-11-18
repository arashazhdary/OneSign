using System.Text.Json;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Extensibility.Domain.Entities;
using Onesign.Modules.Extensibility.Domain.Enums;
using Onesign.Modules.Extensibility.Domain.Repositories;
using Onesign.Modules.Extensibility.Domain.Services;

namespace Onesign.Modules.Extensibility.Infrastructure.Services;

public class WebhookDeliveryService : IWebhookDeliveryService
{
    private readonly IWebhookDeliveryLogRepository _deliveryLogRepository;
    private readonly IWebhookSubscriptionRepository _subscriptionRepository;
    private readonly ILogger<WebhookDeliveryService> _logger;

    public WebhookDeliveryService(
        IWebhookDeliveryLogRepository deliveryLogRepository,
        IWebhookSubscriptionRepository subscriptionRepository,
        ILogger<WebhookDeliveryService> logger)
    {
        _deliveryLogRepository = deliveryLogRepository;
        _subscriptionRepository = subscriptionRepository;
        _logger = logger;
    }

    public async Task<Guid> QueueDeliveryAsync(
        Guid subscriptionId,
        string eventType,
        object payload,
        CancellationToken cancellationToken = default)
    {
        var subscription = await _subscriptionRepository.GetByIdAsync(subscriptionId, cancellationToken);
        if (subscription == null)
        {
            throw new InvalidOperationException($"Webhook subscription {subscriptionId} not found");
        }

        var deliveryLog = new WebhookDeliveryLog
        {
            Id = Guid.NewGuid(),
            TenantId = subscription.TenantId,
            SubscriptionId = subscriptionId,
            EventType = eventType,
            PayloadJson = JsonSerializer.Serialize(new
            {
                EventType = eventType,
                TenantId = subscription.TenantId,
                Timestamp = DateTime.UtcNow,
                CorrelationId = Guid.NewGuid(),
                Data = payload
            }),
            Status = WebhookDeliveryStatus.Pending,
            AttemptCount = 0,
            CreatedAt = DateTime.UtcNow
        };

        await _deliveryLogRepository.AddAsync(deliveryLog, cancellationToken);

        _logger.LogInformation("Queued webhook delivery {DeliveryId} for subscription {SubscriptionId}",
            deliveryLog.Id, subscriptionId);

        return deliveryLog.Id;
    }

    public async Task<WebhookDeliveryLog?> GetDeliveryStatusAsync(
        Guid deliveryId,
        CancellationToken cancellationToken = default)
    {
        return await _deliveryLogRepository.GetByIdAsync(deliveryId, cancellationToken);
    }

    public async Task<IReadOnlyList<WebhookDeliveryLog>> GetPendingDeliveriesAsync(
        int batchSize = 50,
        CancellationToken cancellationToken = default)
    {
        return await _deliveryLogRepository.GetPendingDeliveriesAsync(batchSize, cancellationToken);
    }

    public async Task RetryDeliveryAsync(
        Guid deliveryId,
        CancellationToken cancellationToken = default)
    {
        var delivery = await _deliveryLogRepository.GetByIdAsync(deliveryId, cancellationToken);
        if (delivery == null)
        {
            throw new InvalidOperationException($"Delivery log {deliveryId} not found");
        }

        if (delivery.Status != WebhookDeliveryStatus.Failed)
        {
            throw new InvalidOperationException($"Cannot retry delivery with status {delivery.Status}");
        }

        delivery.Status = WebhookDeliveryStatus.Pending;
        delivery.AttemptCount = 0;
        delivery.ErrorMessage = null;
        delivery.ResponseStatusCode = null;

        await _deliveryLogRepository.UpdateAsync(delivery, cancellationToken);

        _logger.LogInformation("Queued retry for delivery {DeliveryId}", deliveryId);
    }
}
