using System.Net.Http.Headers;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Onesign.Shared.Sms;

/// <summary>
/// Sends SMS via Twilio REST API (Messages resource).
/// </summary>
public class TwilioSmsService : ISmsService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<TwilioSmsService> _logger;

    public TwilioSmsService(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<TwilioSmsService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<bool> SendSmsAsync(
        string to,
        string message,
        CancellationToken cancellationToken = default)
    {
        var accountSid = _configuration["Sms:Twilio:AccountSid"];
        var authToken = _configuration["Sms:Twilio:AuthToken"];
        var fromNumber = _configuration["Sms:Twilio:FromNumber"];

        if (string.IsNullOrWhiteSpace(accountSid)
            || string.IsNullOrWhiteSpace(authToken)
            || string.IsNullOrWhiteSpace(fromNumber))
        {
            _logger.LogWarning("Twilio SMS is not fully configured (AccountSid, AuthToken, or FromNumber missing)");
            return false;
        }

        try
        {
            var url = $"https://api.twilio.com/2010-04-01/Accounts/{accountSid}/Messages.json";
            using var request = new HttpRequestMessage(HttpMethod.Post, url);
            var credentials = Convert.ToBase64String(Encoding.ASCII.GetBytes($"{accountSid}:{authToken}"));
            request.Headers.Authorization = new AuthenticationHeaderValue("Basic", credentials);
            request.Content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["To"] = to,
                ["From"] = fromNumber,
                ["Body"] = message,
            });

            var response = await _httpClient.SendAsync(request, cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Twilio SMS sent to {To}", to);
                return true;
            }

            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogWarning(
                "Twilio SMS failed for {To}: {StatusCode} {Body}",
                to,
                (int)response.StatusCode,
                body);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Twilio SMS exception for {To}", to);
            return false;
        }
    }
}
