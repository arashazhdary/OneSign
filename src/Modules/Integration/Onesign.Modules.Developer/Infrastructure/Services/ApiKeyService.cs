using System.Security.Cryptography;
using Onesign.Modules.Developer.Domain.Services;

namespace Onesign.Modules.Developer.Infrastructure.Services;

public class ApiKeyService : IApiKeyService
{
    private const string KeyPrefix = "onesign_";
    private const int KeyLength = 32; // 32 bytes = 256 bits

    public string GenerateApiKey()
    {
        // Generate 32 random bytes
        var randomBytes = RandomNumberGenerator.GetBytes(KeyLength);
        var keyValue = Convert.ToBase64String(randomBytes)
            .Replace("+", "")
            .Replace("/", "")
            .Replace("=", "")
            .Substring(0, 43); // 43 chars for clean API key

        return $"{KeyPrefix}{keyValue}";
    }

    public string HashApiKey(string plainKey)
    {
        using var sha256 = SHA256.Create();
        var bytes = System.Text.Encoding.UTF8.GetBytes(plainKey);
        var hash = sha256.ComputeHash(bytes);
        return Convert.ToBase64String(hash);
    }

    public string GetKeyPrefix(string plainKey)
    {
        if (plainKey.Length < 16)
            return plainKey;

        return plainKey.Substring(0, Math.Min(16, plainKey.Length));
    }

    public bool VerifyApiKey(string plainKey, string keyHash)
    {
        var computedHash = HashApiKey(plainKey);
        return string.Equals(computedHash, keyHash, StringComparison.Ordinal);
    }
}
