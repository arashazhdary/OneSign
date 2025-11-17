namespace Onesign.Shared.Security;

/// <summary>
/// Provides JWT signing key for token generation and validation.
/// This abstraction allows for different implementations:
/// - Configuration-based (current)
/// - Key Vault (future)
/// - Environment variables (future)
/// </summary>
public interface IJwtSigningKeyProvider
{
    /// <summary>
    /// Gets the JWT signing key.
    /// </summary>
    /// <returns>The signing key as a string</returns>
    string GetSigningKey();
}

