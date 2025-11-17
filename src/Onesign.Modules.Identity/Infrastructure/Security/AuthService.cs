using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Onesign.Modules.Identity.Domain.Entities;
using Onesign.Modules.Identity.Domain.Repositories;
using Onesign.Modules.Identity.Domain.Services;
using Onesign.Shared.Security;

namespace Onesign.Modules.Identity.Infrastructure.Security;

public class AuthService : IAuthService
{
    private readonly IAuthorizationCodeRepository _authorizationCodeRepository;
    private readonly IJwtSigningKeyProvider _signingKeyProvider;

    public AuthService(IJwtSigningKeyProvider signingKeyProvider, IAuthorizationCodeRepository authorizationCodeRepository)
    {
        _signingKeyProvider = signingKeyProvider;
        _authorizationCodeRepository = authorizationCodeRepository;
    }

    public async Task<string> GenerateAuthorizationCodeAsync(Guid tenantUserId, Guid clientId, string redirectUri, string codeChallenge, CancellationToken cancellationToken = default)
    {
        var code = Guid.NewGuid().ToString("N");
        var authorizationCode = new AuthorizationCode
        {
            Id = Guid.NewGuid(),
            Code = code,
            TenantUserId = tenantUserId,
            ApplicationClientId = clientId,
            RedirectUri = redirectUri,
            CodeChallenge = codeChallenge,
            ExpiresAt = DateTime.UtcNow.AddMinutes(10),
            IsUsed = false,
            CreatedAt = DateTime.UtcNow
        };
        
        await _authorizationCodeRepository.AddAsync(authorizationCode, cancellationToken);
        return code;
    }

    public async Task<(Guid TenantUserId, Guid ClientId, string RedirectUri, string CodeChallenge)?> ValidateAuthorizationCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        var authorizationCode = await _authorizationCodeRepository.GetByCodeAsync(code, cancellationToken);
        
        if (authorizationCode == null)
        {
            return null;
        }

        // Mark as used
        authorizationCode.IsUsed = true;
        await _authorizationCodeRepository.UpdateAsync(authorizationCode, cancellationToken);

        return (authorizationCode.TenantUserId, authorizationCode.ApplicationClientId, authorizationCode.RedirectUri, authorizationCode.CodeChallenge);
    }

    public Task<string> GenerateAccessTokenAsync(Guid tenantUserId, Guid tenantId, Guid clientId, CancellationToken cancellationToken = default)
    {
        var header = new { alg = "HS256", typ = "JWT" };
        var payload = new
        {
            sub = tenantUserId.ToString(),
            tenant_id = tenantId.ToString(),
            client_id = clientId.ToString(),
            exp = DateTimeOffset.UtcNow.AddHours(1).ToUnixTimeSeconds(),
            iat = DateTimeOffset.UtcNow.ToUnixTimeSeconds()
        };

        var headerJson = JsonSerializer.Serialize(header);
        var payloadJson = JsonSerializer.Serialize(payload);

        var headerBase64 = Base64UrlEncode(Encoding.UTF8.GetBytes(headerJson));
        var payloadBase64 = Base64UrlEncode(Encoding.UTF8.GetBytes(payloadJson));

        var signingKey = _signingKeyProvider.GetSigningKey();
        var signature = ComputeHMACSHA256($"{headerBase64}.{payloadBase64}", signingKey);
        var token = $"{headerBase64}.{payloadBase64}.{signature}";

        return Task.FromResult(token);
    }

    public Task<string> GenerateIdTokenAsync(Guid tenantUserId, Guid tenantId, Guid clientId, CancellationToken cancellationToken = default)
    {
        return GenerateIdTokenAsync(tenantUserId, tenantId, clientId, null, cancellationToken);
    }

    public Task<string> GenerateIdTokenAsync(Guid tenantUserId, Guid tenantId, Guid clientId, string? email, CancellationToken cancellationToken = default)
    {
        var header = new { alg = "HS256", typ = "JWT" };
        var payload = new Dictionary<string, object>
        {
            { "sub", tenantUserId.ToString() },
            { "tenant_id", tenantId.ToString() },
            { "client_id", clientId.ToString() },
            { "exp", DateTimeOffset.UtcNow.AddHours(1).ToUnixTimeSeconds() },
            { "iat", DateTimeOffset.UtcNow.ToUnixTimeSeconds() }
        };

        if (!string.IsNullOrEmpty(email))
        {
            payload["email"] = email;
        }

        var headerJson = JsonSerializer.Serialize(header);
        var payloadJson = JsonSerializer.Serialize(payload);

        var headerBase64 = Base64UrlEncode(Encoding.UTF8.GetBytes(headerJson));
        var payloadBase64 = Base64UrlEncode(Encoding.UTF8.GetBytes(payloadJson));

        var signingKey = _signingKeyProvider.GetSigningKey();
        var signature = ComputeHMACSHA256($"{headerBase64}.{payloadBase64}", signingKey);
        var token = $"{headerBase64}.{payloadBase64}.{signature}";

        return Task.FromResult(token);
    }

    private static string Base64UrlEncode(byte[] input)
    {
        return Convert.ToBase64String(input)
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');
    }

    private static string ComputeHMACSHA256(string input, string key)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(input));
        return Base64UrlEncode(hash);
    }
}

