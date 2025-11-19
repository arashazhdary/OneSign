using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Onesign.Modules.IdentityLifecycle.Domain.Enums;
using Onesign.Modules.IdentityLifecycle.Domain.Repositories;
using Onesign.Modules.IdentityLifecycle.Domain.Services;

namespace Onesign.Api.BackgroundServices;

public class LifecycleEventProcessorWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<LifecycleEventProcessorWorker> _logger;
    private readonly TimeSpan _pollingInterval = TimeSpan.FromMinutes(5);

    public LifecycleEventProcessorWorker(
        IServiceProvider serviceProvider,
        ILogger<LifecycleEventProcessorWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Lifecycle Event Processor Worker starting");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessPendingEventsAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing lifecycle events");
            }

            await Task.Delay(_pollingInterval, stoppingToken);
        }

        _logger.LogInformation("Lifecycle Event Processor Worker stopping");
    }

    private async Task ProcessPendingEventsAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var eventRepository = scope.ServiceProvider.GetRequiredService<ILifecycleEventRepository>();
        var lifecycleProcessor = scope.ServiceProvider.GetRequiredService<ILifecycleProcessor>();

        var pendingEvents = await eventRepository.GetPendingEventsAsync(cancellationToken);

        if (!pendingEvents.Any())
        {
            _logger.LogDebug("No pending lifecycle events to process");
            return;
        }

        _logger.LogInformation("Processing {Count} pending lifecycle events", pendingEvents.Count);

        foreach (var lifecycleEvent in pendingEvents)
        {
            if (cancellationToken.IsCancellationRequested)
                break;

            // Only process events that are due (effective date has passed)
            if (lifecycleEvent.EffectiveDate > DateTime.UtcNow)
            {
                _logger.LogDebug("Skipping event {EventId} - not yet effective", lifecycleEvent.Id);
                continue;
            }

            try
            {
                switch (lifecycleEvent.EventType)
                {
                    case LifecycleEventType.Joiner:
                        await lifecycleProcessor.ProcessJoinerAsync(lifecycleEvent, cancellationToken);
                        break;

                    case LifecycleEventType.Mover:
                        await lifecycleProcessor.ProcessMoverAsync(lifecycleEvent, cancellationToken);
                        break;

                    case LifecycleEventType.Leaver:
                        await lifecycleProcessor.ProcessLeaverAsync(lifecycleEvent, cancellationToken);
                        break;

                    default:
                        _logger.LogWarning("Unknown lifecycle event type: {EventType}", lifecycleEvent.EventType);
                        break;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process lifecycle event {EventId}", lifecycleEvent.Id);
            }
        }
    }
}
