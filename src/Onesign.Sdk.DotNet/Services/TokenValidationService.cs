using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.IdentityModel.Tokens;
using Onesign.Sdk.DotNet.Models;

namespace Onesign.Sdk.DotNet.Services;

public class TokenValidationService
{
    private readonly HttpClient _httpClient;
    private readonly OnesignOptions _options;
    private JsonWebKeySet? _cachedJwks;
    private DateTime _jwksCacheExpiry = DateTime.MinValue;
    private readonly SemaphoreSlim _jwksLock = new(1, 1);

    public TokenValidationService(HttpClient httpClient, OnesignOptions options)
    {
        _httpClient = httpClient;
        _options = options;
    }

    public async Task<TokenValidationInfo> ValidateTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        var handler = new JwtSecurityTokenHandler();

        if (!handler.CanReadToken(token))
        {
            return new TokenValidationInfo
            {
                IsValid = false,
                Error = "Invalid token format"
            };
        }

        try
        {
            var jwks = await GetJsonWebKeySetAsync(cancellationToken);

            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = _options.BaseUrl.TrimEnd('/'),
                ValidateAudience = true,
                ValidAudience = _options.ClientId,
                ValidateLifetime = true,
                IssuerSigningKeys = jwks.GetSigningKeys(),
                ClockSkew = TimeSpan.FromMinutes(5)
            };

            var principal = handler.ValidateToken(token, validationParameters, out var validatedToken);

            return new TokenValidationInfo
            {
                IsValid = true,
                Claims = principal.Claims.ToDictionary(c => c.Type, c => c.Value),
                Subject = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? principal.FindFirst("sub")?.Value,
                Email = principal.FindFirst(ClaimTypes.Email)?.Value ?? principal.FindFirst("email")?.Value,
                Name = principal.FindFirst(ClaimTypes.Name)?.Value ?? principal.FindFirst("name")?.Value,
                Roles = principal.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList(),
                Permissions = principal.FindAll("permission").Select(c => c.Value).ToList(),
                TenantId = principal.FindFirst("tenant_id")?.Value,
                ExpiresAt = validatedToken.ValidTo,
                IssuedAt = validatedToken.ValidFrom
            };
        }
        catch (SecurityTokenExpiredException)
        {
            return new TokenValidationInfo
            {
                IsValid = false,
                Error = "Token has expired"
            };
        }
        catch (SecurityTokenException ex)
        {
            return new TokenValidationInfo
            {
                IsValid = false,
                Error = $"Token validation failed: {ex.Message}"
            };
        }
    }

    public async Task<bool> IsTokenValidAsync(string token, CancellationToken cancellationToken = default)
    {
        var result = await ValidateTokenAsync(token, cancellationToken);
        return result.IsValid;
    }

    public TokenInfo? DecodeToken(string token)
    {
        var handler = new JwtSecurityTokenHandler();

        if (!handler.CanReadToken(token))
        {
            return null;
        }

        var jwtToken = handler.ReadJwtToken(token);

        return new TokenInfo
        {
            Subject = jwtToken.Subject,
            Issuer = jwtToken.Issuer,
            Audience = jwtToken.Audiences.FirstOrDefault() ?? string.Empty,
            ExpiresAt = jwtToken.ValidTo,
            IssuedAt = jwtToken.ValidFrom,
            Claims = jwtToken.Claims.ToDictionary(c => c.Type, c => c.Value)
        };
    }

    public async Task<TokenIntrospectionResult> IntrospectTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        var formData = new Dictionary<string, string>
        {
            ["token"] = token,
            ["client_id"] = _options.ClientId,
            ["client_secret"] = _options.ClientSecret
        };

        var response = await _httpClient.PostAsync(
            "/connect/introspect",
            new FormUrlEncodedContent(formData),
            cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            return new TokenIntrospectionResult { Active = false };
        }

        var content = await response.Content.ReadAsStringAsync(cancellationToken);
        return JsonSerializer.Deserialize<TokenIntrospectionResult>(content) ?? new TokenIntrospectionResult { Active = false };
    }

    public async Task<bool> RevokeTokenAsync(string token, string tokenTypeHint = "access_token", CancellationToken cancellationToken = default)
    {
        var formData = new Dictionary<string, string>
        {
            ["token"] = token,
            ["token_type_hint"] = tokenTypeHint,
            ["client_id"] = _options.ClientId,
            ["client_secret"] = _options.ClientSecret
        };

        var response = await _httpClient.PostAsync(
            "/connect/revocation",
            new FormUrlEncodedContent(formData),
            cancellationToken);

        return response.IsSuccessStatusCode;
    }

    private async Task<JsonWebKeySet> GetJsonWebKeySetAsync(CancellationToken cancellationToken)
    {
        await _jwksLock.WaitAsync(cancellationToken);
        try
        {
            if (_cachedJwks != null && DateTime.UtcNow < _jwksCacheExpiry)
            {
                return _cachedJwks;
            }

            var discoveryResponse = await _httpClient.GetAsync("/.well-known/openid-configuration", cancellationToken);
            discoveryResponse.EnsureSuccessStatusCode();
            using var discoveryDoc = JsonDocument.Parse(await discoveryResponse.Content.ReadAsStringAsync(cancellationToken));
            var jwksUri = discoveryDoc.RootElement.TryGetProperty("jwks_uri", out var jwksProp)
                ? jwksProp.GetString()
                : null;
            var jwksPath = string.IsNullOrEmpty(jwksUri)
                ? "/.well-known/jwks.json"
                : new Uri(jwksUri!).AbsolutePath;

            var response = await _httpClient.GetAsync(jwksPath, cancellationToken);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync(cancellationToken);
            _cachedJwks = new JsonWebKeySet(json);
            _jwksCacheExpiry = DateTime.UtcNow.AddHours(1);

            return _cachedJwks;
        }
        finally
        {
            _jwksLock.Release();
        }
    }
}

public class TokenValidationInfo
{
    public bool IsValid { get; set; }
    public string? Error { get; set; }
    public string? Subject { get; set; }
    public string? Email { get; set; }
    public string? Name { get; set; }
    public string? TenantId { get; set; }
    public List<string> Roles { get; set; } = new();
    public List<string> Permissions { get; set; } = new();
    public DateTime ExpiresAt { get; set; }
    public DateTime IssuedAt { get; set; }
    public Dictionary<string, string> Claims { get; set; } = new();
}

public class TokenInfo
{
    public string Subject { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public DateTime IssuedAt { get; set; }
    public Dictionary<string, string> Claims { get; set; } = new();
}

public class TokenIntrospectionResult
{
    public bool Active { get; set; }
    public string? Scope { get; set; }
    public string? ClientId { get; set; }
    public string? Username { get; set; }
    public string? TokenType { get; set; }
    public long? Exp { get; set; }
    public long? Iat { get; set; }
    public long? Nbf { get; set; }
    public string? Sub { get; set; }
    public string? Aud { get; set; }
    public string? Iss { get; set; }
    public string? Jti { get; set; }
}
