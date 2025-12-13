namespace Onesign.Modules.Identity.Domain.Services;

/// <summary>
/// Service for verifying Google reCAPTCHA v3 tokens
/// </summary>
public interface IRecaptchaService
{
    /// <summary>
    /// Verifies a reCAPTCHA token with Google's verification API
    /// </summary>
    /// <param name="token">The reCAPTCHA token to verify</param>
    /// <param name="expectedAction">The expected action name (e.g., "login")</param>
    /// <param name="minimumScore">Minimum acceptable score (0.0 to 1.0). Default is 0.5</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if verification succeeds and score is above minimum, false otherwise</returns>
    Task<bool> VerifyTokenAsync(string token, string expectedAction = "login", double minimumScore = 0.5, CancellationToken cancellationToken = default);

    /// <summary>
    /// Verifies a reCAPTCHA token and returns detailed verification result
    /// </summary>
    /// <param name="token">The reCAPTCHA token to verify</param>
    /// <param name="expectedAction">The expected action name (e.g., "login")</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Detailed verification result including score and error codes</returns>
    Task<RecaptchaVerificationResult> VerifyTokenDetailedAsync(string token, string expectedAction = "login", CancellationToken cancellationToken = default);
}

/// <summary>
/// Detailed result of reCAPTCHA verification
/// </summary>
public class RecaptchaVerificationResult
{
    public bool Success { get; set; }
    public double Score { get; set; }
    public string Action { get; set; } = string.Empty;
    public DateTime ChallengeTimestamp { get; set; }
    public string Hostname { get; set; } = string.Empty;
    public List<string> ErrorCodes { get; set; } = new();
}
