using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Onesign.Api.Data;

namespace Onesign.Api.BackgroundServices;

/// <summary>
/// Background worker that processes pending webhook deliveries,
/// sends HTTP requests with HMAC signatures, and handles retries.
/// </summary>
public class WebhookDeliveryWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<WebhookDeliveryWorker> _logger;
    private readonly IConfiguration _configuration;
    private readonly IHttpClientFactory _httpClientFactory;

    private const int MaxRetries = 5;
    private const int BatchSize = 50;
    private const int TimeoutSeconds = 30;

    public WebhookDeliveryWorker(
        IServiceProvider serviceProvider,
        ILogger<WebhookDeliveryWorker> logger,
        IConfiguration configuration,
        IHttpClientFactory httpClientFactory)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _configuration = configuration;
        _httpClientFactory = httpClientFactory;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var intervalSeconds = _configuration.GetValue("BackgroundServices:WebhookDelivery:IntervalSeconds", 30);
        var checkInterval = TimeSpan.FromSeconds(intervalSeconds);

        _logger.LogInformation("WebhookDeliveryWorker starting with interval of {Interval} seconds", intervalSeconds);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessPendingWebhooksAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in WebhookDeliveryWorker execution");
            }

            await Task.Delay(checkInterval, stoppingToken);
        }
    }

    private async Task ProcessPendingWebhooksAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<OnesignDbContext>();

        // Status: 0 = Pending, 1 = Retrying
        var pendingDeliveries = await dbContext.WebhookDeliveryLogs
            .Where(w => w.Status == 0 || w.Status == 1)
            .OrderBy(w => w.CreatedAt)
            .Take(BatchSize)
            .ToListAsync(cancellationToken);

        if (!pendingDeliveries.Any())
        {
            return;
        }

        _logger.LogInformation("Processing {Count} pending webhook deliveries", pendingDeliveries.Count);

        foreach (var delivery in pendingDeliveries)
        {
            try
            {
                await DeliverWebhookAsync(dbContext, delivery, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error delivering webhook {DeliveryId}", delivery.Id);
                await HandleDeliveryFailureAsync(delivery, ex.Message);
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Webhook delivery batch completed at {Time}", DateTime.UtcNow);
    }

    private async Task DeliverWebhookAsync(
        OnesignDbContext dbContext,
        Onesign.Modules.Extensibility.Infrastructure.EfCore.Entities.WebhookDeliveryLogEntity delivery,
        CancellationToken cancellationToken)
    {
        // Get subscription details
        var subscription = await dbContext.WebhookSubscriptions
            .FirstOrDefaultAsync(s => s.Id == delivery.SubscriptionId, cancellationToken);

        if (subscription == null)
        {
            delivery.Status = 3; // Failed - subscription not found
            delivery.ErrorMessage = "Webhook subscription not found";
            _logger.LogWarning("Webhook subscription {SubscriptionId} not found for delivery {DeliveryId}",
                delivery.SubscriptionId, delivery.Id);
            return;
        }

        if (!subscription.IsEnabled)
        {
            delivery.Status = 4; // Skipped - subscription disabled
            delivery.ErrorMessage = "Webhook subscription is disabled";
            _logger.LogDebug("Skipping webhook delivery {DeliveryId} - subscription disabled", delivery.Id);
            return;
        }

        var httpClient = _httpClientFactory.CreateClient();
        httpClient.Timeout = TimeSpan.FromSeconds(TimeoutSeconds);

        // Prepare the request
        var payload = delivery.PayloadJson;
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString();
        var signature = ComputeHmacSignature(timestamp, payload, subscription.Secret);

        var request = new HttpRequestMessage(HttpMethod.Post, subscription.EndpointUrl)
        {
            Content = new StringContent(payload, Encoding.UTF8, "application/json")
        };

        // Add webhook headers
        request.Headers.Add("X-Webhook-Id", delivery.Id.ToString());
        request.Headers.Add("X-Webhook-Timestamp", timestamp);
        request.Headers.Add("X-Webhook-Signature", $"sha256={signature}");
        request.Headers.Add("X-Webhook-Event", delivery.EventType);
        request.Headers.Add("User-Agent", "OneSign-Webhook/1.0");

        try
        {
            var response = await httpClient.SendAsync(request, cancellationToken);

            delivery.AttemptCount++;
            delivery.LastAttemptAt = DateTime.UtcNow;
            delivery.ResponseStatusCode = (int)response.StatusCode;

            if (response.IsSuccessStatusCode)
            {
                delivery.Status = 2; // Delivered
                delivery.ErrorMessage = null;

                // Update subscription last delivery info
                subscription.LastDeliveryAt = DateTime.UtcNow;
                subscription.LastDeliveryStatus = "Success";

                _logger.LogInformation(
                    "Webhook {DeliveryId} delivered successfully to {Endpoint} with status {StatusCode}",
                    delivery.Id, subscription.EndpointUrl, response.StatusCode);
            }
            else
            {
                var errorBody = await response.Content.ReadAsStringAsync(cancellationToken);
                delivery.ErrorMessage = $"HTTP {response.StatusCode}: {errorBody.Substring(0, Math.Min(500, errorBody.Length))}";

                await HandleDeliveryFailureAsync(delivery, delivery.ErrorMessage);

                subscription.LastDeliveryAt = DateTime.UtcNow;
                subscription.LastDeliveryStatus = $"Failed: {response.StatusCode}";
            }
        }
        catch (HttpRequestException ex)
        {
            delivery.AttemptCount++;
            delivery.LastAttemptAt = DateTime.UtcNow;
            await HandleDeliveryFailureAsync(delivery, $"Connection error: {ex.Message}");

            subscription.LastDeliveryAt = DateTime.UtcNow;
            subscription.LastDeliveryStatus = "Failed: Connection error";
        }
        catch (TaskCanceledException)
        {
            delivery.AttemptCount++;
            delivery.LastAttemptAt = DateTime.UtcNow;
            await HandleDeliveryFailureAsync(delivery, "Request timeout");

            subscription.LastDeliveryAt = DateTime.UtcNow;
            subscription.LastDeliveryStatus = "Failed: Timeout";
        }
    }

    private Task HandleDeliveryFailureAsync(
        Onesign.Modules.Extensibility.Infrastructure.EfCore.Entities.WebhookDeliveryLogEntity delivery,
        string errorMessage)
    {
        delivery.ErrorMessage = errorMessage;

        if (delivery.AttemptCount >= MaxRetries)
        {
            delivery.Status = 3; // Failed permanently
            _logger.LogWarning("Webhook delivery {DeliveryId} failed permanently after {Attempts} attempts: {Error}",
                delivery.Id, delivery.AttemptCount, errorMessage);
        }
        else
        {
            delivery.Status = 1; // Retrying
            _logger.LogDebug("Webhook delivery {DeliveryId} will be retried (attempt {Attempt}/{MaxRetries})",
                delivery.Id, delivery.AttemptCount, MaxRetries);
        }

        return Task.CompletedTask;
    }

    private static string ComputeHmacSignature(string timestamp, string payload, string secret)
    {
        var signaturePayload = $"{timestamp}.{payload}";
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(signaturePayload));
        return Convert.ToHexString(hash).ToLowerInvariant();
    }
}
