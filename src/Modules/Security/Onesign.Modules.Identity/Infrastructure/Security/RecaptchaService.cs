using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Identity.Domain.Services;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Onesign.Modules.Identity.Infrastructure.Security;

/// <summary>
/// Implementation of Google reCAPTCHA v3 verification service
/// </summary>
public class RecaptchaService : IRecaptchaService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<RecaptchaService> _logger;
    private readonly HttpClient _httpClient;
    private const string VerificationUrl = "https://www.google.com/recaptcha/api/siteverify";

    public RecaptchaService(
        IConfiguration configuration,
        ILogger<RecaptchaService> logger,
        IHttpClientFactory httpClientFactory)
    {
        _configuration = configuration;
        _logger = logger;
        _httpClient = httpClientFactory.CreateClient("RecaptchaClient");
    }

    public async Task<bool> VerifyTokenAsync(
        string token,
        string expectedAction = "login",
        double minimumScore = 0.5,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            _logger.LogWarning("reCAPTCHA token is null or empty");
            return false;
        }

        try
        {
            var result = await VerifyTokenDetailedAsync(token, expectedAction, cancellationToken);

            if (!result.Success)
            {
                _logger.LogWarning("reCAPTCHA verification failed. Error codes: {ErrorCodes}",
                    string.Join(", ", result.ErrorCodes));
                return false;
            }

            if (result.Score < minimumScore)
            {
                _logger.LogWarning("reCAPTCHA score {Score} is below minimum {MinimumScore}",
                    result.Score, minimumScore);
                return false;
            }

            if (!string.IsNullOrEmpty(expectedAction) && result.Action != expectedAction)
            {
                _logger.LogWarning("reCAPTCHA action mismatch. Expected: {Expected}, Got: {Actual}",
                    expectedAction, result.Action);
                return false;
            }

            _logger.LogInformation("reCAPTCHA verification successful. Score: {Score}, Action: {Action}",
                result.Score, result.Action);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying reCAPTCHA token");
            return false;
        }
    }

    public async Task<RecaptchaVerificationResult> VerifyTokenDetailedAsync(
        string token,
        string expectedAction = "login",
        CancellationToken cancellationToken = default)
    {
        var secretKey = _configuration["ReCaptcha:SecretKey"];
        if (string.IsNullOrWhiteSpace(secretKey))
        {
            _logger.LogError("reCAPTCHA secret key is not configured");
            return new RecaptchaVerificationResult
            {
                Success = false,
                ErrorCodes = new List<string> { "secret-key-not-configured" }
            };
        }

        try
        {
            var requestContent = new FormUrlEncodedContent(new[]
            {
                new KeyValuePair<string, string>("secret", secretKey),
                new KeyValuePair<string, string>("response", token)
            });

            var response = await _httpClient.PostAsync(VerificationUrl, requestContent, cancellationToken);
            var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

            var googleResponse = JsonSerializer.Deserialize<GoogleRecaptchaResponse>(responseContent);

            if (googleResponse == null)
            {
                _logger.LogError("Failed to deserialize reCAPTCHA response");
                return new RecaptchaVerificationResult
                {
                    Success = false,
                    ErrorCodes = new List<string> { "deserialization-failed" }
                };
            }

            return new RecaptchaVerificationResult
            {
                Success = googleResponse.Success,
                Score = googleResponse.Score,
                Action = googleResponse.Action ?? string.Empty,
                ChallengeTimestamp = googleResponse.ChallengeTs,
                Hostname = googleResponse.Hostname ?? string.Empty,
                ErrorCodes = googleResponse.ErrorCodes ?? new List<string>()
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception during reCAPTCHA verification");
            return new RecaptchaVerificationResult
            {
                Success = false,
                ErrorCodes = new List<string> { "verification-exception" }
            };
        }
    }

    /// <summary>
    /// Google reCAPTCHA API response model
    /// </summary>
    private class GoogleRecaptchaResponse
    {
        [JsonPropertyName("success")]
        public bool Success { get; set; }

        [JsonPropertyName("score")]
        public double Score { get; set; }

        [JsonPropertyName("action")]
        public string? Action { get; set; }

        [JsonPropertyName("challenge_ts")]
        public DateTime ChallengeTs { get; set; }

        [JsonPropertyName("hostname")]
        public string? Hostname { get; set; }

        [JsonPropertyName("error-codes")]
        public List<string>? ErrorCodes { get; set; }
    }
}
