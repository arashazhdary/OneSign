using Microsoft.Extensions.Configuration;

namespace Onesign.Shared.Security;

/// <summary>
/// Implementation of IJwtSigningKeyProvider that reads the signing key from configuration.
/// Supports reading from:
/// - appsettings.json: "Jwt:SigningKey"
/// - Environment variable: "JWT_SIGNING_KEY"
/// </summary>
public class ConfigurationJwtSigningKeyProvider : IJwtSigningKeyProvider
{
    private readonly IConfiguration _configuration;
    private readonly string _defaultKey;

    public ConfigurationJwtSigningKeyProvider(IConfiguration configuration)
    {
        _configuration = configuration;
        _defaultKey = "your-secret-signing-key-change-in-production-min-32-chars";
    }

    public string GetSigningKey()
    {
        // Priority: Environment variable > Configuration > Default
        var key = Environment.GetEnvironmentVariable("JWT_SIGNING_KEY")
                  ?? _configuration["Jwt:SigningKey"]
                  ?? _defaultKey;

        if (key == _defaultKey)
        {
            // Log warning in production
            System.Diagnostics.Debug.WriteLine(
                "WARNING: Using default JWT signing key. This should be changed in production!");
        }

        return key;
    }
}

