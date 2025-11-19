using Onesign.Modules.Crypto.Domain.Entities;
using Onesign.Modules.Crypto.Domain.Enums;

namespace Onesign.Modules.Crypto.Domain.Services;

/// <summary>
/// Service for generating cryptographic keys of various types and algorithms.
/// </summary>
public interface IKeyGenerator
{
    /// <summary>
    /// Generates a new key version for the specified key set.
    /// </summary>
    /// <param name="keySetId">The key set to generate a key for</param>
    /// <param name="purpose">The purpose of the key (signing, encryption, etc.)</param>
    /// <param name="algorithm">The algorithm to use (RS256, ES256, A256GCM, etc.)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The generated key version</returns>
    Task<KeyVersion> GenerateAsync(
        Guid keySetId,
        KeyPurpose purpose,
        string algorithm,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Generates a signing key pair (asymmetric).
    /// </summary>
    /// <param name="algorithm">The signing algorithm (RS256, RS384, RS512, ES256, ES384, ES512)</param>
    /// <returns>Key material containing the private key</returns>
    byte[] GenerateSigningKey(string algorithm);

    /// <summary>
    /// Generates an encryption key.
    /// </summary>
    /// <param name="algorithm">The encryption algorithm (A128GCM, A192GCM, A256GCM, RSA-OAEP)</param>
    /// <returns>Key material</returns>
    byte[] GenerateEncryptionKey(string algorithm);

    /// <summary>
    /// Generates a symmetric key for HMAC or AES operations.
    /// </summary>
    /// <param name="keySize">Key size in bits</param>
    /// <returns>Key material</returns>
    byte[] GenerateSymmetricKey(int keySize);

    /// <summary>
    /// Validates that an algorithm is supported.
    /// </summary>
    /// <param name="algorithm">The algorithm to validate</param>
    /// <param name="purpose">The key purpose</param>
    /// <returns>True if the algorithm is supported</returns>
    bool IsAlgorithmSupported(string algorithm, KeyPurpose purpose);

    /// <summary>
    /// Gets the list of supported algorithms for a given purpose.
    /// </summary>
    /// <param name="purpose">The key purpose</param>
    /// <returns>List of supported algorithm names</returns>
    IEnumerable<string> GetSupportedAlgorithms(KeyPurpose purpose);
}
