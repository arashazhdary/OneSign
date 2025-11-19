namespace Onesign.Modules.Extensibility.Domain.Services;

public interface IWebhookDispatcher
{
    Task DispatchEventAsync(Guid tenantId, string eventType, object payload, CancellationToken cancellationToken = default);
}
