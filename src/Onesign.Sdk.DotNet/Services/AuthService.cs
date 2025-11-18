using System.Net.Http.Json;
using System.Text.Json;
using Onesign.Sdk.DotNet.Models;

namespace Onesign.Sdk.DotNet.Services;

public class AuthService
{
    private readonly HttpClient _httpClient;
    private readonly OnesignOptions _options;
    private TokenResponse? _cachedToken;
    private readonly SemaphoreSlim _tokenLock = new(1, 1);

    public AuthService(HttpClient httpClient, OnesignOptions options)
    {
        _httpClient = httpClient;
        _options = options;
    }

    public async Task<TokenResponse> LoginAsync(string email, string password, CancellationToken cancellationToken = default)
    {
        var request = new LoginRequest
        {
            Email = email,
            Password = password
        };

        var response = await _httpClient.PostAsJsonAsync("/api/auth/login", request, cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);

        var token = await response.Content.ReadFromJsonAsync<TokenResponse>(cancellationToken)
            ?? throw new OnesignException("Failed to deserialize token response");

        token.ExpiresAt = DateTimeOffset.UtcNow.AddSeconds(token.ExpiresIn);
        _cachedToken = token;

        return token;
    }

    public async Task<TokenResponse> ClientCredentialsAsync(CancellationToken cancellationToken = default)
    {
        var formData = new Dictionary<string, string>
        {
            ["grant_type"] = "client_credentials",
            ["client_id"] = _options.ClientId,
            ["client_secret"] = _options.ClientSecret,
            ["scope"] = "openid profile email api"
        };

        var response = await _httpClient.PostAsync("/connect/token", new FormUrlEncodedContent(formData), cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);

        var token = await response.Content.ReadFromJsonAsync<TokenResponse>(cancellationToken)
            ?? throw new OnesignException("Failed to deserialize token response");

        token.ExpiresAt = DateTimeOffset.UtcNow.AddSeconds(token.ExpiresIn);
        _cachedToken = token;

        return token;
    }

    public async Task LogoutAsync(CancellationToken cancellationToken = default)
    {
        if (_cachedToken != null)
        {
            var request = new HttpRequestMessage(HttpMethod.Post, "/api/auth/logout");
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _cachedToken.AccessToken);

            await _httpClient.SendAsync(request, cancellationToken);
            _cachedToken = null;
        }
    }

    public async Task<TokenResponse> RefreshTokenAsync(string? refreshToken = null, CancellationToken cancellationToken = default)
    {
        var token = refreshToken ?? _cachedToken?.RefreshToken
            ?? throw new OnesignException("No refresh token available");

        var formData = new Dictionary<string, string>
        {
            ["grant_type"] = "refresh_token",
            ["refresh_token"] = token,
            ["client_id"] = _options.ClientId,
            ["client_secret"] = _options.ClientSecret
        };

        var response = await _httpClient.PostAsync("/connect/token", new FormUrlEncodedContent(formData), cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);

        var newToken = await response.Content.ReadFromJsonAsync<TokenResponse>(cancellationToken)
            ?? throw new OnesignException("Failed to deserialize token response");

        newToken.ExpiresAt = DateTimeOffset.UtcNow.AddSeconds(newToken.ExpiresIn);
        _cachedToken = newToken;

        return newToken;
    }

    public async Task<TokenValidationResult> ValidateTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        var formData = new Dictionary<string, string>
        {
            ["token"] = token,
            ["client_id"] = _options.ClientId,
            ["client_secret"] = _options.ClientSecret
        };

        var response = await _httpClient.PostAsync("/connect/introspect", new FormUrlEncodedContent(formData), cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);

        return await response.Content.ReadFromJsonAsync<TokenValidationResult>(cancellationToken)
            ?? throw new OnesignException("Failed to deserialize validation result");
    }

    public async Task<string> GetAccessTokenAsync(CancellationToken cancellationToken = default)
    {
        await _tokenLock.WaitAsync(cancellationToken);
        try
        {
            if (_cachedToken == null)
            {
                await ClientCredentialsAsync(cancellationToken);
            }
            else if (_cachedToken.IsExpired && !string.IsNullOrEmpty(_cachedToken.RefreshToken))
            {
                await RefreshTokenAsync(cancellationToken: cancellationToken);
            }
            else if (_cachedToken.IsExpired)
            {
                await ClientCredentialsAsync(cancellationToken);
            }

            return _cachedToken!.AccessToken;
        }
        finally
        {
            _tokenLock.Release();
        }
    }

    public TokenResponse? GetCachedToken() => _cachedToken;

    public void SetToken(TokenResponse token)
    {
        _cachedToken = token;
    }

    private static async Task EnsureSuccessAsync(HttpResponseMessage response, CancellationToken cancellationToken)
    {
        if (!response.IsSuccessStatusCode)
        {
            var content = await response.Content.ReadAsStringAsync(cancellationToken);
            ErrorResponse? error = null;

            try
            {
                error = JsonSerializer.Deserialize<ErrorResponse>(content);
            }
            catch
            {
                // Ignore deserialization errors
            }

            throw new OnesignException(
                error?.ErrorDescription ?? error?.Error ?? $"Request failed with status {response.StatusCode}",
                response.StatusCode,
                error?.Error,
                error?.ValidationErrors,
                error?.TraceId);
        }
    }
}
