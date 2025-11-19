using System.Security.Cryptography;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Crypto.Domain.Entities;
using Onesign.Modules.Crypto.Domain.Enums;
using Onesign.Modules.Crypto.Domain.Repositories;
using Onesign.Modules.Crypto.Domain.Services;

namespace Onesign.Modules.Crypto.Infrastructure.Services;

/// <summary>
/// Local key store implementation that stores keys in the database with encryption.
/// </summary>
public class LocalKeyStore : IKeyStore
{
    private readonly IKeySetRepository _keySetRepository;
    private readonly IKeyVersionRepository _keyVersionRepository;
    private readonly ILogger<LocalKeyStore> _logger;
    private readonly byte[] _masterKey;

    public LocalKeyStore(
        IKeySetRepository keySetRepository,
        IKeyVersionRepository keyVersionRepository,
        ILogger<LocalKeyStore> logger,
        Microsoft.Extensions.Configuration.IConfiguration configuration)
    {
        _keySetRepository = keySetRepository;
        _keyVersionRepository = keyVersionRepository;
        _logger = logger;

        var masterKeyBase64 = configuration["Crypto:MasterKey"];
        if (string.IsNullOrEmpty(masterKeyBase64))
        {
            _masterKey = GenerateDefaultMasterKey();
            _logger.LogWarning("Using default master key. Configure Crypto:MasterKey for production.");
        }
        else
        {
            _masterKey = Convert.FromBase64String(masterKeyBase64);
        }
    }

    public async Task<KeyVersion> GenerateKeyAsync(
        Guid keySetId,
        string algorithm,
        CancellationToken cancellationToken = default)
    {
        var keySet = await _keySetRepository.GetByIdAsync(keySetId, cancellationToken);
        if (keySet == null)
        {
            throw new InvalidOperationException($"KeySet {keySetId} not found");
        }

        var keyMaterial = GenerateKeyMaterial(algorithm);
        var encryptedMaterial = EncryptKeyMaterial(keyMaterial);

        var keyVersion = new KeyVersion
        {
            Id = Guid.NewGuid(),
            KeySetId = keySetId,
            Kid = $"{keySetId}-{DateTime.UtcNow:yyyyMMddHHmmss}",
            Algorithm = algorithm,
            KeyMaterial = encryptedMaterial,
            State = KeyVersionState.Active,
            CreatedAt = DateTime.UtcNow,
            ActivatedAt = DateTime.UtcNow
        };

        await _keyVersionRepository.AddAsync(keyVersion, cancellationToken);

        _logger.LogInformation(
            "Generated new key version {KeyVersionId} with algorithm {Algorithm} for KeySet {KeySetId}",
            keyVersion.Id, algorithm, keySetId);

        return keyVersion;
    }

    public async Task<byte[]> GetPrivateKeyAsync(Guid keyVersionId, CancellationToken cancellationToken = default)
    {
        var keyVersion = await _keyVersionRepository.GetByIdAsync(keyVersionId, cancellationToken);
        if (keyVersion == null)
        {
            throw new KeyNotFoundException($"Key version {keyVersionId} not found");
        }

        if (keyVersion.State == KeyVersionState.Revoked)
        {
            throw new InvalidOperationException($"Key version {keyVersionId} has been revoked");
        }

        return DecryptKeyMaterial(keyVersion.KeyMaterial);
    }

    public async Task<byte[]> GetPublicKeyAsync(Guid keyVersionId, CancellationToken cancellationToken = default)
    {
        var keyVersion = await _keyVersionRepository.GetByIdAsync(keyVersionId, cancellationToken);
        if (keyVersion == null)
        {
            throw new KeyNotFoundException($"Key version {keyVersionId} not found");
        }

        var privateKey = DecryptKeyMaterial(keyVersion.KeyMaterial);
        return ExtractPublicKey(privateKey, keyVersion.Algorithm);
    }

    private static byte[] GenerateKeyMaterial(string algorithm)
    {
        return algorithm.ToUpperInvariant() switch
        {
            "RS256" or "RS384" or "RS512" => GenerateRsaKey(2048),
            "RS256-4096" or "RS384-4096" or "RS512-4096" => GenerateRsaKey(4096),
            "ES256" => GenerateEcKey(ECCurve.NamedCurves.nistP256),
            "ES384" => GenerateEcKey(ECCurve.NamedCurves.nistP384),
            "ES512" => GenerateEcKey(ECCurve.NamedCurves.nistP521),
            "A128GCM" => GenerateAesKey(128),
            "A192GCM" => GenerateAesKey(192),
            "A256GCM" => GenerateAesKey(256),
            "RSA-OAEP" or "RSA-OAEP-256" => GenerateRsaKey(2048),
            _ => throw new ArgumentException($"Unsupported algorithm: {algorithm}")
        };
    }

    private static byte[] GenerateRsaKey(int keySize)
    {
        using var rsa = RSA.Create(keySize);
        return rsa.ExportRSAPrivateKey();
    }

    private static byte[] GenerateEcKey(ECCurve curve)
    {
        using var ecdsa = ECDsa.Create(curve);
        return ecdsa.ExportECPrivateKey();
    }

    private static byte[] GenerateAesKey(int keySize)
    {
        using var aes = Aes.Create();
        aes.KeySize = keySize;
        aes.GenerateKey();
        return aes.Key;
    }

    private byte[] EncryptKeyMaterial(byte[] plaintext)
    {
        using var aes = Aes.Create();
        aes.Key = _masterKey;
        aes.GenerateIV();

        using var encryptor = aes.CreateEncryptor();
        var ciphertext = encryptor.TransformFinalBlock(plaintext, 0, plaintext.Length);

        var result = new byte[aes.IV.Length + ciphertext.Length];
        Buffer.BlockCopy(aes.IV, 0, result, 0, aes.IV.Length);
        Buffer.BlockCopy(ciphertext, 0, result, aes.IV.Length, ciphertext.Length);

        return result;
    }

    private byte[] DecryptKeyMaterial(byte[] encrypted)
    {
        using var aes = Aes.Create();
        aes.Key = _masterKey;

        var iv = new byte[16];
        var ciphertext = new byte[encrypted.Length - 16];
        Buffer.BlockCopy(encrypted, 0, iv, 0, 16);
        Buffer.BlockCopy(encrypted, 16, ciphertext, 0, ciphertext.Length);

        aes.IV = iv;

        using var decryptor = aes.CreateDecryptor();
        return decryptor.TransformFinalBlock(ciphertext, 0, ciphertext.Length);
    }

    private static byte[] ExtractPublicKey(byte[] privateKey, string algorithm)
    {
        if (algorithm.StartsWith("RS") || algorithm.StartsWith("RSA"))
        {
            using var rsa = RSA.Create();
            rsa.ImportRSAPrivateKey(privateKey, out _);
            return rsa.ExportRSAPublicKey();
        }

        if (algorithm.StartsWith("ES"))
        {
            using var ecdsa = ECDsa.Create();
            ecdsa.ImportECPrivateKey(privateKey, out _);
            return ecdsa.ExportSubjectPublicKeyInfo();
        }

        return privateKey;
    }

    private static byte[] GenerateDefaultMasterKey()
    {
        var key = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(key);
        return key;
    }
}
