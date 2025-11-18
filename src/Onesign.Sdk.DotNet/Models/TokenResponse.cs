using System.Text.Json.Serialization;

namespace Onesign.Sdk.DotNet.Models;

public class TokenResponse
{
    [JsonPropertyName("access_token")]
    public string AccessToken { get; set; } = string.Empty;

    [JsonPropertyName("token_type")]
    public string TokenType { get; set; } = "Bearer";

    [JsonPropertyName("expires_in")]
    public int ExpiresIn { get; set; }

    [JsonPropertyName("refresh_token")]
    public string? RefreshToken { get; set; }

    [JsonPropertyName("id_token")]
    public string? IdToken { get; set; }

    [JsonPropertyName("scope")]
    public string? Scope { get; set; }

    [JsonIgnore]
    public DateTimeOffset ExpiresAt { get; set; }

    public bool IsExpired => DateTimeOffset.UtcNow >= ExpiresAt;
}

public class LoginRequest
{
    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    [JsonPropertyName("password")]
    public string Password { get; set; } = string.Empty;

    [JsonPropertyName("rememberMe")]
    public bool RememberMe { get; set; } = false;
}

public class RefreshTokenRequest
{
    [JsonPropertyName("refresh_token")]
    public string RefreshToken { get; set; } = string.Empty;
}

public class ValidateTokenRequest
{
    [JsonPropertyName("token")]
    public string Token { get; set; } = string.Empty;
}

public class TokenValidationResult
{
    [JsonPropertyName("active")]
    public bool Active { get; set; }

    [JsonPropertyName("sub")]
    public string? Subject { get; set; }

    [JsonPropertyName("client_id")]
    public string? ClientId { get; set; }

    [JsonPropertyName("exp")]
    public long? ExpiresAt { get; set; }

    [JsonPropertyName("iat")]
    public long? IssuedAt { get; set; }

    [JsonPropertyName("scope")]
    public string? Scope { get; set; }
}
