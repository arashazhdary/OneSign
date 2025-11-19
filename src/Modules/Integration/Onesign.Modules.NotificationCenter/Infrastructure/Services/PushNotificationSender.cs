using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Onesign.Modules.NotificationCenter.Domain.Entities;
using Onesign.Modules.NotificationCenter.Domain.Enums;
using Onesign.Modules.NotificationCenter.Domain.Repositories;
using Onesign.Modules.NotificationCenter.Domain.Services;

namespace Onesign.Modules.NotificationCenter.Infrastructure.Services;

public class PushNotificationSender : INotificationSender
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly INotificationChannelConfigRepository _configRepository;
    private readonly ILogger<PushNotificationSender> _logger;

    public PushNotificationSender(
        IHttpClientFactory httpClientFactory,
        INotificationChannelConfigRepository configRepository,
        ILogger<PushNotificationSender> logger)
    {
        _httpClientFactory = httpClientFactory;
        _configRepository = configRepository;
        _logger = logger;
    }

    public async Task<bool> SendAsync(NotificationOutboxItem item, CancellationToken cancellationToken = default)
    {
        if (item.Channel != NotificationChannel.Push)
        {
            _logger.LogWarning("PushNotificationSender received non-Push notification: {NotificationId}", item.Id);
            return false;
        }

        try
        {
            var config = await _configRepository.GetByChannelAsync(item.TenantId, NotificationChannel.Push, cancellationToken);
            if (config == null || !config.IsEnabled)
            {
                _logger.LogWarning("Push channel not configured or disabled for tenant: {TenantId}", item.TenantId);
                return false;
            }

            var pushConfig = JsonSerializer.Deserialize<PushConfig>(config.ConfigurationJson);
            if (pushConfig == null)
            {
                _logger.LogError("Invalid Push configuration for tenant: {TenantId}", item.TenantId);
                return false;
            }

            var client = _httpClientFactory.CreateClient("PushProvider");

            var payload = new
            {
                to = item.RecipientAddress,
                notification = new
                {
                    title = item.Subject,
                    body = item.Body
                },
                data = JsonSerializer.Deserialize<object>(item.ContextDataJson)
            };

            client.DefaultRequestHeaders.Add("Authorization", $"key={pushConfig.ServerKey}");
            var response = await client.PostAsJsonAsync(pushConfig.FcmEndpoint, payload, cancellationToken);

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Push notification sent successfully: {NotificationId} to {Recipient}",
                    item.Id, item.RecipientAddress);
                return true;
            }

            var error = await response.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogError("Push send failed: {NotificationId}, Status: {Status}, Error: {Error}",
                item.Id, response.StatusCode, error);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send push notification: {NotificationId} to {Recipient}",
                item.Id, item.RecipientAddress);
            return false;
        }
    }

    private class PushConfig
    {
        public string ServerKey { get; set; } = string.Empty;
        public string FcmEndpoint { get; set; } = "https://fcm.googleapis.com/fcm/send";
    }
}
