using System.Security.Cryptography;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Crypto.Domain.Entities;
using Onesign.Modules.Crypto.Domain.Enums;
using Onesign.Modules.Crypto.Domain.Repositories;
using Onesign.Modules.Crypto.Domain.Services;

namespace Onesign.Modules.Crypto.Infrastructure.Services;

/// <summary>
/// Service for generating cryptographic keys of various types and algorithms.
/// </summary>
public class KeyGenerator : IKeyGenerator
{
    private readonly IKeyVersionRepository _keyVersionRepository;
    private readonly IKeySetRepository _keySetRepository;
    private readonly ILogger<KeyGenerator> _logger;

    private static readonly Dictionary<KeyPurpose, HashSet<string>> SupportedAlgorithms = new()
    {
        {
            KeyPurpose.Signing, new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "RS256", "RS384", "RS512",
                "ES256", "ES384", "ES512",
                "PS256", "PS384", "PS512"
            }
        },
        {
            KeyPurpose.Encryption, new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "A128GCM", "A192GCM", "A256GCM",
                "A128CBC-HS256", "A192CBC-HS384", "A256CBC-HS512",
                "RSA-OAEP", "RSA-OAEP-256"
            }
        },
        {
            KeyPurpose.TokenEncryption, new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "A256GCM", "RSA-OAEP-256", "A128CBC-HS256"
            }
        }
    };

    public KeyGenerator(
        IKeyVersionRepository keyVersionRepository,
        IKeySetRepository keySetRepository,
        ILogger<KeyGenerator> logger)
    {
        _keyVersionRepository = keyVersionRepository;
        _keySetRepository = keySetRepository;
        _logger = logger;
    }

    public async Task<KeyVersion> GenerateAsync(
        Guid keySetId,
        KeyPurpose purpose,
        string algorithm,
        CancellationToken cancellationToken = default)
    {
        if (!IsAlgorithmSupported(algorithm, purpose))
        {
            throw new ArgumentException($"Algorithm {algorithm} is not supported for {purpose}");
        }

        var keySet = await _keySetRepository.GetByIdAsync(keySetId, cancellationToken);
        if (keySet == null)
        {
            throw new InvalidOperationException($"KeySet {keySetId} not found");
        }

        var keyMaterial = purpose switch
        {
            KeyPurpose.Signing => GenerateSigningKey(algorithm),
            KeyPurpose.Encryption or KeyPurpose.TokenEncryption => GenerateEncryptionKey(algorithm),
            _ => throw new ArgumentException($"Unknown key purpose: {purpose}")
        };

        var keyVersion = new KeyVersion
        {
            Id = Guid.NewGuid(),
            KeySetId = keySetId,
            Kid = GenerateKid(keySetId),
            Algorithm = algorithm,
            KeyMaterial = keyMaterial,
            State = KeyVersionState.Active,
            CreatedAt = DateTime.UtcNow,
            ActivatedAt = DateTime.UtcNow
        };

        await _keyVersionRepository.AddAsync(keyVersion, cancellationToken);

        _logger.LogInformation(
            "Generated key {KeyVersionId} ({Kid}) with algorithm {Algorithm} for purpose {Purpose}",
            keyVersion.Id, keyVersion.Kid, algorithm, purpose);

        return keyVersion;
    }

    public byte[] GenerateSigningKey(string algorithm)
    {
        return algorithm.ToUpperInvariant() switch
        {
            "RS256" or "RS384" or "RS512" => GenerateRsaSigningKey(2048),
            "PS256" or "PS384" or "PS512" => GenerateRsaSigningKey(2048),
            "ES256" => GenerateEcSigningKey(ECCurve.NamedCurves.nistP256),
            "ES384" => GenerateEcSigningKey(ECCurve.NamedCurves.nistP384),
            "ES512" => GenerateEcSigningKey(ECCurve.NamedCurves.nistP521),
            _ => throw new ArgumentException($"Unsupported signing algorithm: {algorithm}")
        };
    }

    public byte[] GenerateEncryptionKey(string algorithm)
    {
        return algorithm.ToUpperInvariant() switch
        {
            "A128GCM" or "A128CBC-HS256" => GenerateSymmetricKey(128),
            "A192GCM" or "A192CBC-HS384" => GenerateSymmetricKey(192),
            "A256GCM" or "A256CBC-HS512" => GenerateSymmetricKey(256),
            "RSA-OAEP" or "RSA-OAEP-256" => GenerateRsaEncryptionKey(2048),
            _ => throw new ArgumentException($"Unsupported encryption algorithm: {algorithm}")
        };
    }

    public byte[] GenerateSymmetricKey(int keySize)
    {
        var keyBytes = keySize / 8;
        var key = new byte[keyBytes];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(key);
        return key;
    }

    public bool IsAlgorithmSupported(string algorithm, KeyPurpose purpose)
    {
        return SupportedAlgorithms.TryGetValue(purpose, out var algorithms)
               && algorithms.Contains(algorithm);
    }

    public IEnumerable<string> GetSupportedAlgorithms(KeyPurpose purpose)
    {
        return SupportedAlgorithms.TryGetValue(purpose, out var algorithms)
            ? algorithms.ToList()
            : Enumerable.Empty<string>();
    }

    private static byte[] GenerateRsaSigningKey(int keySize)
    {
        using var rsa = RSA.Create(keySize);
        return rsa.ExportRSAPrivateKey();
    }

    private static byte[] GenerateRsaEncryptionKey(int keySize)
    {
        using var rsa = RSA.Create(keySize);
        return rsa.ExportRSAPrivateKey();
    }

    private static byte[] GenerateEcSigningKey(ECCurve curve)
    {
        using var ecdsa = ECDsa.Create(curve);
        return ecdsa.ExportECPrivateKey();
    }

    private static string GenerateKid(Guid keySetId)
    {
        var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
        var random = Guid.NewGuid().ToString("N")[..8];
        return $"{keySetId:N}-{timestamp}-{random}";
    }
}
