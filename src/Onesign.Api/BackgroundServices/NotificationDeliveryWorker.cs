using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Onesign.Data.Contexts;

namespace Onesign.Api.BackgroundServices;

/// <summary>
/// Background worker that processes pending notification outbox items
/// and delivers them via appropriate channels (Email, SMS, Push).
/// </summary>
public class NotificationDeliveryWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<NotificationDeliveryWorker> _logger;
    private readonly IConfiguration _configuration;

    private const int MaxRetries = 5;
    private const int BatchSize = 100;

    public NotificationDeliveryWorker(
        IServiceProvider serviceProvider,
        ILogger<NotificationDeliveryWorker> logger,
        IConfiguration configuration)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _configuration = configuration;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var intervalSeconds = _configuration.GetValue("BackgroundServices:NotificationDelivery:IntervalSeconds", 30);
        var checkInterval = TimeSpan.FromSeconds(intervalSeconds);

        _logger.LogInformation("NotificationDeliveryWorker starting with interval of {Interval} seconds", intervalSeconds);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessPendingNotificationsAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in NotificationDeliveryWorker execution");
            }

            await Task.Delay(checkInterval, stoppingToken);
        }
    }

    private async Task ProcessPendingNotificationsAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<OnesignDbContext>();

        // Status: 0 = Pending
        var pendingItems = await dbContext.NotificationOutboxItems
            .Where(n => n.Status == 0 && (n.NextRetryAt == null || n.NextRetryAt <= DateTime.UtcNow))
            .OrderBy(n => n.Priority)
            .ThenBy(n => n.CreatedAt)
            .Take(BatchSize)
            .ToListAsync(cancellationToken);

        if (!pendingItems.Any())
        {
            return;
        }

        _logger.LogInformation("Processing {Count} pending notification items", pendingItems.Count);

        foreach (var item in pendingItems)
        {
            try
            {
                var success = await SendNotificationAsync(item, scope.ServiceProvider, cancellationToken);

                if (success)
                {
                    item.Status = 1; // Sent
                    item.SentAt = DateTime.UtcNow;
                    item.ErrorMessage = null;
                    _logger.LogDebug("Notification {Id} sent successfully via channel {Channel}", item.Id, item.Channel);
                }
                else
                {
                    await HandleFailedDeliveryAsync(item);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending notification {Id}", item.Id);
                item.ErrorMessage = ex.Message;
                await HandleFailedDeliveryAsync(item);
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Notification delivery batch completed at {Time}", DateTime.UtcNow);
    }

    private async Task<bool> SendNotificationAsync(
        Onesign.Modules.NotificationCenter.Infrastructure.EfCore.Entities.NotificationOutboxItemEntity item,
        IServiceProvider serviceProvider,
        CancellationToken cancellationToken)
    {
        // Channel: 0 = Email, 1 = SMS, 2 = Push
        return item.Channel switch
        {
            0 => await SendEmailAsync(item, serviceProvider, cancellationToken),
            1 => await SendSmsAsync(item, serviceProvider, cancellationToken),
            2 => await SendPushAsync(item, serviceProvider, cancellationToken),
            _ => throw new NotSupportedException($"Channel {item.Channel} is not supported")
        };
    }

    private async Task<bool> SendEmailAsync(
        Onesign.Modules.NotificationCenter.Infrastructure.EfCore.Entities.NotificationOutboxItemEntity item,
        IServiceProvider serviceProvider,
        CancellationToken cancellationToken)
    {
        var emailService = serviceProvider.GetService<Onesign.Shared.Email.IEmailService>();

        if (emailService == null)
        {
            _logger.LogWarning("Email service not configured, skipping email notification {Id}", item.Id);
            return false;
        }

        await emailService.SendEmailAsync(
            item.RecipientAddress,
            item.Subject,
            item.Body,
            cancellationToken);

        return true;
    }

    private Task<bool> SendSmsAsync(
        Onesign.Modules.NotificationCenter.Infrastructure.EfCore.Entities.NotificationOutboxItemEntity item,
        IServiceProvider serviceProvider,
        CancellationToken cancellationToken)
    {
        // SMS provider integration would go here
        _logger.LogInformation("SMS notification {Id} to {Recipient} - SMS provider not configured",
            item.Id, item.RecipientAddress);

        // Return true for now as SMS is not yet implemented
        return Task.FromResult(true);
    }

    private Task<bool> SendPushAsync(
        Onesign.Modules.NotificationCenter.Infrastructure.EfCore.Entities.NotificationOutboxItemEntity item,
        IServiceProvider serviceProvider,
        CancellationToken cancellationToken)
    {
        // Push notification integration would go here
        _logger.LogInformation("Push notification {Id} to user {UserId} - Push provider not configured",
            item.Id, item.RecipientUserId);

        // Return true for now as Push is not yet implemented
        return Task.FromResult(true);
    }

    private Task HandleFailedDeliveryAsync(
        Onesign.Modules.NotificationCenter.Infrastructure.EfCore.Entities.NotificationOutboxItemEntity item)
    {
        item.AttemptCount++;

        if (item.AttemptCount >= MaxRetries)
        {
            item.Status = 2; // Failed
            _logger.LogWarning("Notification {Id} failed after {Attempts} attempts", item.Id, item.AttemptCount);
        }
        else
        {
            // Exponential backoff: 2^attempt * 30 seconds (30s, 60s, 120s, 240s, 480s)
            var delaySeconds = Math.Pow(2, item.AttemptCount) * 30;
            item.NextRetryAt = DateTime.UtcNow.AddSeconds(delaySeconds);
            _logger.LogDebug("Notification {Id} scheduled for retry at {RetryAt}", item.Id, item.NextRetryAt);
        }

        return Task.CompletedTask;
    }
}
