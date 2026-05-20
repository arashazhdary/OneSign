using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Onesign.Shared.Email;

/// <summary>
/// SendGrid HTTP API v3 mail sender.
/// </summary>
public class SendGridEmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<SendGridEmailService> _logger;

    public SendGridEmailService(
        IConfiguration configuration,
        IHttpClientFactory httpClientFactory,
        ILogger<SendGridEmailService> logger)
    {
        _configuration = configuration;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public Task<bool> SendEmailAsync(
        string to,
        string subject,
        string body,
        bool isHtml = true,
        CancellationToken cancellationToken = default) =>
        SendEmailAsync(to, to, subject, body, isHtml, cancellationToken);

    public async Task<bool> SendEmailAsync(
        string to,
        string toDisplayName,
        string subject,
        string body,
        bool isHtml = true,
        CancellationToken cancellationToken = default)
    {
        var apiKey = _configuration["Email:SendGrid:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            _logger.LogWarning("SendGrid API key is not configured");
            return false;
        }

        var fromEmail = _configuration["Email:From:Address"] ?? "noreply@onesign.local";
        var fromName = _configuration["Email:From:Name"] ?? "OneSign";

        var payload = new
        {
            personalizations = new[]
            {
                new
                {
                    to = new[] { new { email = to, name = toDisplayName } },
                    subject,
                },
            },
            from = new { email = fromEmail, name = fromName },
            content = new[]
            {
                new
                {
                    type = isHtml ? "text/html" : "text/plain",
                    value = body,
                },
            },
        };

        try
        {
            var client = _httpClientFactory.CreateClient(nameof(SendGridEmailService));
            using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.sendgrid.com/v3/mail/send");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
            request.Content = new StringContent(
                JsonSerializer.Serialize(payload),
                Encoding.UTF8,
                "application/json");

            var response = await client.SendAsync(request, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogError("SendGrid returned {StatusCode}: {Error}", response.StatusCode, error);
                return false;
            }

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email via SendGrid to {To}", to);
            return false;
        }
    }
}
