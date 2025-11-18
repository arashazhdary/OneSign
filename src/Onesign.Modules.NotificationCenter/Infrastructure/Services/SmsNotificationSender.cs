using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Onesign.Modules.NotificationCenter.Domain.Entities;
using Onesign.Modules.NotificationCenter.Domain.Enums;
using Onesign.Modules.NotificationCenter.Domain.Repositories;
using Onesign.Modules.NotificationCenter.Domain.Services;

namespace Onesign.Modules.NotificationCenter.Infrastructure.Services;

public class SmsNotificationSender : INotificationSender
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly INotificationChannelConfigRepository _configRepository;
    private readonly ILogger<SmsNotificationSender> _logger;

    public SmsNotificationSender(
        IHttpClientFactory httpClientFactory,
        INotificationChannelConfigRepository configRepository,
        ILogger<SmsNotificationSender> logger)
    {
        _httpClientFactory = httpClientFactory;
        _configRepository = configRepository;
        _logger = logger;
    }

    public async Task<bool> SendAsync(NotificationOutboxItem item, CancellationToken cancellationToken = default)
    {
        if (item.Channel != NotificationChannel.Sms)
        {
            _logger.LogWarning("SmsNotificationSender received non-SMS notification: {NotificationId}", item.Id);
            return false;
        }

        try
        {
            var config = await _configRepository.GetByChannelAsync(item.TenantId, NotificationChannel.Sms, cancellationToken);
            if (config == null || !config.IsEnabled)
            {
                _logger.LogWarning("SMS channel not configured or disabled for tenant: {TenantId}", item.TenantId);
                return false;
            }

            var smsConfig = JsonSerializer.Deserialize<SmsConfig>(config.ConfigurationJson);
            if (smsConfig == null)
            {
                _logger.LogError("Invalid SMS configuration for tenant: {TenantId}", item.TenantId);
                return false;
            }

            var client = _httpClientFactory.CreateClient("SmsProvider");

            var payload = new
            {
                to = item.RecipientAddress,
                message = item.Body,
                from = smsConfig.SenderId
            };

            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {smsConfig.ApiKey}");
            var response = await client.PostAsJsonAsync(smsConfig.ApiEndpoint, payload, cancellationToken);

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("SMS notification sent successfully: {NotificationId} to {Recipient}",
                    item.Id, item.RecipientAddress);
                return true;
            }

            var error = await response.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogError("SMS send failed: {NotificationId}, Status: {Status}, Error: {Error}",
                item.Id, response.StatusCode, error);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send SMS notification: {NotificationId} to {Recipient}",
                item.Id, item.RecipientAddress);
            return false;
        }
    }

    private class SmsConfig
    {
        public string ApiKey { get; set; } = string.Empty;
        public string ApiEndpoint { get; set; } = string.Empty;
        public string SenderId { get; set; } = string.Empty;
    }
}
