namespace Onesign.Modules.Extensibility.Domain.Services;

public interface IEventPublisher
{
    Task PublishAsync(Guid tenantId, string eventType, object payload, CancellationToken cancellationToken = default);
    Task PublishAsync(Guid tenantId, string eventType, object payload, Guid? correlationId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<string>> GetSupportedEventTypesAsync(CancellationToken cancellationToken = default);
}
