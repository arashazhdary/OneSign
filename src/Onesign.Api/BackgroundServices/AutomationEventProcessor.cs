using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Automation.Domain.Services;

namespace Onesign.Api.BackgroundServices;

/// <summary>
/// Background service that processes automation events from the notification outbox
/// and triggers workflows based on event subscriptions.
/// </summary>
public class AutomationEventProcessor : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<AutomationEventProcessor> _logger;

    public AutomationEventProcessor(
        IServiceProvider serviceProvider,
        ILogger<AutomationEventProcessor> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("AutomationEventProcessor started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessPendingEventsAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing automation events");
            }

            await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
        }

        _logger.LogInformation("AutomationEventProcessor stopped");
    }

    private async Task ProcessPendingEventsAsync(CancellationToken stoppingToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var automationEngine = scope.ServiceProvider.GetRequiredService<IAutomationEngine>();

        // This would integrate with the existing notification/event outbox pattern
        // For now, this is a placeholder that can be extended to poll events
        // from the NotificationOutbox or a dedicated AutomationEventQueue

        await Task.CompletedTask;
    }

    /// <summary>
    /// Public method to trigger automation for a specific event.
    /// Can be called from other services or controllers.
    /// </summary>
    public async Task TriggerAutomationAsync(string eventType, object payload, string? eventId = null)
    {
        using var scope = _serviceProvider.CreateScope();
        var automationEngine = scope.ServiceProvider.GetRequiredService<IAutomationEngine>();

        await automationEngine.HandleEventAsync(eventType, payload, eventId);
    }
}

/// <summary>
/// Extension methods for automation event triggering.
/// </summary>
public static class AutomationExtensions
{
    /// <summary>
    /// Triggers automation workflows for the given event.
    /// This can be called from any service after a significant event occurs.
    /// </summary>
    public static async Task TriggerAutomationAsync(
        this IServiceProvider serviceProvider,
        string eventType,
        object payload,
        string? eventId = null,
        CancellationToken cancellationToken = default)
    {
        using var scope = serviceProvider.CreateScope();
        var automationEngine = scope.ServiceProvider.GetRequiredService<IAutomationEngine>();
        await automationEngine.HandleEventAsync(eventType, payload, eventId, cancellationToken);
    }
}
