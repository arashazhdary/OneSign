namespace Onesign.Modules.Automation.Domain.Services;

public interface IAutomationEngine
{
    Task HandleEventAsync(string eventType, object payload, string? eventId = null, CancellationToken cancellationToken = default);
}
