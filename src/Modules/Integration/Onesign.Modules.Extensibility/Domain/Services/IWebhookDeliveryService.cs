using Onesign.Modules.Extensibility.Domain.Entities;

namespace Onesign.Modules.Extensibility.Domain.Services;

public interface IWebhookDeliveryService
{
    Task<Guid> QueueDeliveryAsync(
        Guid subscriptionId,
        string eventType,
        object payload,
        CancellationToken cancellationToken = default);

    Task<WebhookDeliveryLog?> GetDeliveryStatusAsync(
        Guid deliveryId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<WebhookDeliveryLog>> GetPendingDeliveriesAsync(
        int batchSize = 50,
        CancellationToken cancellationToken = default);

    Task RetryDeliveryAsync(
        Guid deliveryId,
        CancellationToken cancellationToken = default);
}
