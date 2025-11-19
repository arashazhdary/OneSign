using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Onesign.Modules.NotificationCenter.Domain.Entities;
using Onesign.Modules.NotificationCenter.Domain.Enums;
using Onesign.Modules.NotificationCenter.Domain.Repositories;
using Onesign.Modules.NotificationCenter.Domain.Services;

namespace Onesign.Modules.NotificationCenter.Infrastructure.Services;

public class WebhookNotificationSender : INotificationSender
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly INotificationChannelConfigRepository _configRepository;
    private readonly ILogger<WebhookNotificationSender> _logger;

    public WebhookNotificationSender(
        IHttpClientFactory httpClientFactory,
        INotificationChannelConfigRepository configRepository,
        ILogger<WebhookNotificationSender> logger)
    {
        _httpClientFactory = httpClientFactory;
        _configRepository = configRepository;
        _logger = logger;
    }

    public async Task<bool> SendAsync(NotificationOutboxItem item, CancellationToken cancellationToken = default)
    {
        if (item.Channel != NotificationChannel.Webhook)
        {
            _logger.LogWarning("WebhookNotificationSender received non-Webhook notification: {NotificationId}", item.Id);
            return false;
        }

        try
        {
            var config = await _configRepository.GetByChannelAsync(item.TenantId, NotificationChannel.Webhook, cancellationToken);
            var webhookConfig = config != null
                ? JsonSerializer.Deserialize<WebhookConfig>(config.ConfigurationJson)
                : new WebhookConfig();

            var client = _httpClientFactory.CreateClient("WebhookSender");

            // Add default headers from config
            if (webhookConfig?.DefaultHeaders != null)
            {
                foreach (var header in webhookConfig.DefaultHeaders)
                {
                    client.DefaultRequestHeaders.TryAddWithoutValidation(header.Key, header.Value);
                }
            }

            var payload = new
            {
                id = item.Id,
                tenantId = item.TenantId,
                eventType = item.EventType,
                subject = item.Subject,
                body = item.Body,
                timestamp = DateTime.UtcNow,
                data = JsonSerializer.Deserialize<object>(item.ContextDataJson)
            };

            // RecipientAddress contains the webhook URL
            var response = await client.PostAsJsonAsync(item.RecipientAddress, payload, cancellationToken);

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Webhook notification sent successfully: {NotificationId} to {Url}",
                    item.Id, item.RecipientAddress);
                return true;
            }

            var error = await response.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogError("Webhook send failed: {NotificationId}, URL: {Url}, Status: {Status}, Error: {Error}",
                item.Id, item.RecipientAddress, response.StatusCode, error);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send webhook notification: {NotificationId} to {Url}",
                item.Id, item.RecipientAddress);
            return false;
        }
    }

    private class WebhookConfig
    {
        public Dictionary<string, string> DefaultHeaders { get; set; } = new();
        public int TimeoutSeconds { get; set; } = 30;
    }
}
