using Onesign.Modules.Crypto.Domain.Entities;
using Onesign.Modules.Crypto.Domain.Enums;

namespace Onesign.Modules.Crypto.Domain.Services;

/// <summary>
/// Provider for retrieving keys for various cryptographic operations.
/// </summary>
public interface IKeyProvider
{
    /// <summary>
    /// Gets the current active key for signing operations.
    /// </summary>
    /// <param name="tenantId">Optional tenant ID for tenant-specific keys</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The active signing key</returns>
    Task<KeyVersion> GetSigningKeyAsync(Guid? tenantId = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the current active key for encryption operations.
    /// </summary>
    /// <param name="tenantId">Optional tenant ID for tenant-specific keys</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The active encryption key</returns>
    Task<KeyVersion> GetEncryptionKeyAsync(Guid? tenantId = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a key by its key identifier (kid).
    /// </summary>
    /// <param name="kid">The key identifier</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The key version, or null if not found</returns>
    Task<KeyVersion?> GetKeyByKidAsync(string kid, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all active keys for JWKS endpoint.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of active key versions</returns>
    Task<IEnumerable<KeyVersion>> GetActiveKeysAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets keys for validation (includes recently retired keys for grace period).
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of keys valid for signature verification</returns>
    Task<IEnumerable<KeyVersion>> GetValidationKeysAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the JSON Web Key Set (JWKS) for public key distribution.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>JWKS as a dictionary</returns>
    Task<JsonWebKeySet> GetJwksAsync(CancellationToken cancellationToken = default);
}

/// <summary>
/// JSON Web Key Set structure for public key distribution.
/// </summary>
public class JsonWebKeySet
{
    /// <summary>
    /// List of JSON Web Keys.
    /// </summary>
    public List<JsonWebKey> Keys { get; set; } = new();
}

/// <summary>
/// JSON Web Key structure.
/// </summary>
public class JsonWebKey
{
    /// <summary>
    /// Key type (e.g., "RSA", "EC").
    /// </summary>
    public string Kty { get; set; } = string.Empty;

    /// <summary>
    /// Public key use (e.g., "sig", "enc").
    /// </summary>
    public string Use { get; set; } = string.Empty;

    /// <summary>
    /// Key identifier.
    /// </summary>
    public string Kid { get; set; } = string.Empty;

    /// <summary>
    /// Algorithm (e.g., "RS256", "ES256").
    /// </summary>
    public string Alg { get; set; } = string.Empty;

    /// <summary>
    /// RSA modulus (for RSA keys).
    /// </summary>
    public string? N { get; set; }

    /// <summary>
    /// RSA public exponent (for RSA keys).
    /// </summary>
    public string? E { get; set; }

    /// <summary>
    /// EC curve name (for EC keys).
    /// </summary>
    public string? Crv { get; set; }

    /// <summary>
    /// EC X coordinate (for EC keys).
    /// </summary>
    public string? X { get; set; }

    /// <summary>
    /// EC Y coordinate (for EC keys).
    /// </summary>
    public string? Y { get; set; }

    /// <summary>
    /// X.509 certificate chain.
    /// </summary>
    public List<string>? X5c { get; set; }

    /// <summary>
    /// X.509 certificate SHA-1 thumbprint.
    /// </summary>
    public string? X5t { get; set; }

    /// <summary>
    /// X.509 certificate SHA-256 thumbprint.
    /// </summary>
    public string? X5tS256 { get; set; }
}
