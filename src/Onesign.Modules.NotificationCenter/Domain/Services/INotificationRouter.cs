namespace Onesign.Modules.NotificationCenter.Domain.Services;

public interface INotificationRouter
{
    Task RouteEventAsync(Guid tenantId, string eventType, Dictionary<string, object> context, CancellationToken cancellationToken = default);
}
