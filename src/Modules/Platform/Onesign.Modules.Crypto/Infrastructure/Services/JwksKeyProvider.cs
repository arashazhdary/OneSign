using System.Security.Cryptography;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Crypto.Domain.Entities;
using Onesign.Modules.Crypto.Domain.Enums;
using Onesign.Modules.Crypto.Domain.Repositories;
using Onesign.Modules.Crypto.Domain.Services;

namespace Onesign.Modules.Crypto.Infrastructure.Services;

/// <summary>
/// Provider for retrieving keys and generating JWKS responses.
/// </summary>
public class JwksKeyProvider : IKeyProvider
{
    private readonly IKeySetRepository _keySetRepository;
    private readonly IKeyVersionRepository _keyVersionRepository;
    private readonly IKeyStore _keyStore;
    private readonly IMemoryCache _cache;
    private readonly ILogger<JwksKeyProvider> _logger;

    private const string JwksCacheKey = "jwks";
    private static readonly TimeSpan CacheExpiration = TimeSpan.FromMinutes(5);

    public JwksKeyProvider(
        IKeySetRepository keySetRepository,
        IKeyVersionRepository keyVersionRepository,
        IKeyStore keyStore,
        IMemoryCache cache,
        ILogger<JwksKeyProvider> logger)
    {
        _keySetRepository = keySetRepository;
        _keyVersionRepository = keyVersionRepository;
        _keyStore = keyStore;
        _cache = cache;
        _logger = logger;
    }

    public async Task<KeyVersion> GetSigningKeyAsync(Guid? tenantId = null, CancellationToken cancellationToken = default)
    {
        var keySets = await _keySetRepository.GetByPurposeAsync(KeyPurpose.Signing, cancellationToken);
        var targetKeySet = tenantId.HasValue
            ? keySets.FirstOrDefault(k => k.TenantId == tenantId.Value)
            : keySets.FirstOrDefault(k => k.TenantId == null);

        if (targetKeySet == null)
        {
            targetKeySet = keySets.FirstOrDefault();
        }

        if (targetKeySet == null)
        {
            throw new InvalidOperationException("No signing key set found");
        }

        var activeKey = await _keyVersionRepository.GetActiveKeyAsync(targetKeySet.Id, cancellationToken);
        if (activeKey == null)
        {
            throw new InvalidOperationException($"No active signing key found for KeySet {targetKeySet.Id}");
        }

        return activeKey;
    }

    public async Task<KeyVersion> GetEncryptionKeyAsync(Guid? tenantId = null, CancellationToken cancellationToken = default)
    {
        var keySets = await _keySetRepository.GetByPurposeAsync(KeyPurpose.Encryption, cancellationToken);
        var targetKeySet = tenantId.HasValue
            ? keySets.FirstOrDefault(k => k.TenantId == tenantId.Value)
            : keySets.FirstOrDefault(k => k.TenantId == null);

        if (targetKeySet == null)
        {
            targetKeySet = keySets.FirstOrDefault();
        }

        if (targetKeySet == null)
        {
            throw new InvalidOperationException("No encryption key set found");
        }

        var activeKey = await _keyVersionRepository.GetActiveKeyAsync(targetKeySet.Id, cancellationToken);
        if (activeKey == null)
        {
            throw new InvalidOperationException($"No active encryption key found for KeySet {targetKeySet.Id}");
        }

        return activeKey;
    }

    public async Task<KeyVersion?> GetKeyByKidAsync(string kid, CancellationToken cancellationToken = default)
    {
        return await _keyVersionRepository.GetByKidAsync(kid, cancellationToken);
    }

    public async Task<IEnumerable<KeyVersion>> GetActiveKeysAsync(CancellationToken cancellationToken = default)
    {
        return await _keyVersionRepository.GetActiveKeysAsync(cancellationToken);
    }

    public async Task<IEnumerable<KeyVersion>> GetValidationKeysAsync(CancellationToken cancellationToken = default)
    {
        var activeKeys = await _keyVersionRepository.GetActiveKeysAsync(cancellationToken);
        var recentlyRetiredKeys = await _keyVersionRepository.GetRecentlyRetiredKeysAsync(
            TimeSpan.FromDays(7),
            cancellationToken);

        return activeKeys.Concat(recentlyRetiredKeys);
    }

    public async Task<JsonWebKeySet> GetJwksAsync(CancellationToken cancellationToken = default)
    {
        if (_cache.TryGetValue(JwksCacheKey, out JsonWebKeySet? cachedJwks) && cachedJwks != null)
        {
            return cachedJwks;
        }

        var activeKeys = await GetActiveKeysAsync(cancellationToken);
        var signingKeys = activeKeys.Where(k => IsSigningAlgorithm(k.Algorithm)).ToList();

        var jwks = new JsonWebKeySet();

        foreach (var key in signingKeys)
        {
            try
            {
                var jwk = await ConvertToJwkAsync(key, cancellationToken);
                if (jwk != null)
                {
                    jwks.Keys.Add(jwk);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to convert key {KeyId} to JWK", key.Id);
            }
        }

        _cache.Set(JwksCacheKey, jwks, CacheExpiration);
        _logger.LogInformation("Generated JWKS with {KeyCount} keys", jwks.Keys.Count);

        return jwks;
    }

    private async Task<JsonWebKey?> ConvertToJwkAsync(KeyVersion key, CancellationToken cancellationToken)
    {
        var publicKeyBytes = await _keyStore.GetPublicKeyAsync(key.Id, cancellationToken);

        if (key.Algorithm.StartsWith("RS") || key.Algorithm.StartsWith("PS"))
        {
            return CreateRsaJwk(key, publicKeyBytes);
        }

        if (key.Algorithm.StartsWith("ES"))
        {
            return CreateEcJwk(key, publicKeyBytes);
        }

        _logger.LogWarning("Unsupported algorithm for JWK conversion: {Algorithm}", key.Algorithm);
        return null;
    }

    private static JsonWebKey CreateRsaJwk(KeyVersion key, byte[] publicKeyBytes)
    {
        using var rsa = RSA.Create();
        rsa.ImportRSAPublicKey(publicKeyBytes, out _);
        var parameters = rsa.ExportParameters(false);

        return new JsonWebKey
        {
            Kty = "RSA",
            Use = "sig",
            Kid = key.Kid,
            Alg = key.Algorithm,
            N = Base64UrlEncode(parameters.Modulus!),
            E = Base64UrlEncode(parameters.Exponent!)
        };
    }

    private static JsonWebKey CreateEcJwk(KeyVersion key, byte[] publicKeyBytes)
    {
        using var ecdsa = ECDsa.Create();
        ecdsa.ImportSubjectPublicKeyInfo(publicKeyBytes, out _);
        var parameters = ecdsa.ExportParameters(false);

        var curve = key.Algorithm switch
        {
            "ES256" => "P-256",
            "ES384" => "P-384",
            "ES512" => "P-521",
            _ => "P-256"
        };

        return new JsonWebKey
        {
            Kty = "EC",
            Use = "sig",
            Kid = key.Kid,
            Alg = key.Algorithm,
            Crv = curve,
            X = Base64UrlEncode(parameters.Q.X!),
            Y = Base64UrlEncode(parameters.Q.Y!)
        };
    }

    private static bool IsSigningAlgorithm(string algorithm)
    {
        return algorithm.StartsWith("RS") ||
               algorithm.StartsWith("PS") ||
               algorithm.StartsWith("ES");
    }

    private static string Base64UrlEncode(byte[] data)
    {
        return Convert.ToBase64String(data)
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');
    }
}
