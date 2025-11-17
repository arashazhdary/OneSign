namespace Onesign.Modules.Developer.Domain.Services;

public interface IApiKeyService
{
    /// <summary>
    /// Generates a secure API key with prefix
    /// </summary>
    /// <returns>Plain text API key (only returned once)</returns>
    string GenerateApiKey();

    /// <summary>
    /// Hashes an API key using SHA256
    /// </summary>
    string HashApiKey(string plainKey);

    /// <summary>
    /// Extracts the prefix from an API key
    /// </summary>
    string GetKeyPrefix(string plainKey);

    /// <summary>
    /// Verifies an API key against its hash
    /// </summary>
    bool VerifyApiKey(string plainKey, string keyHash);
}
