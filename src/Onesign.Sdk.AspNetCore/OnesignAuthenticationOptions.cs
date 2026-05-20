namespace Onesign.Sdk.AspNetCore;

/// <summary>
/// Configuration for OneSign JWT bearer authentication in ASP.NET Core.
/// Bind from <c>Onesign</c> section in appsettings.
/// </summary>
public class OnesignAuthenticationOptions
{
    public const string SectionName = "Onesign";

    /// <summary>
    /// OneSign issuer / authority base URL (e.g. https://login.example.com).
    /// </summary>
    public string Authority { get; set; } = string.Empty;

    /// <summary>
    /// Expected audience (typically OAuth client id / API resource).
    /// </summary>
    public string? Audience { get; set; }

    /// <summary>
    /// OAuth client id; used as audience when <see cref="Audience"/> is not set.
    /// </summary>
    public string? ClientId { get; set; }

    /// <summary>
    /// HS256 signing key shared with the OneSign deployment (maps to Jwt:SigningKey).
    /// Required while OneSign uses symmetric JWT signing.
    /// </summary>
    public string? SigningKey { get; set; }

    public bool ValidateIssuer { get; set; } = true;

    public bool ValidateAudience { get; set; } = true;

    public string AuthenticationScheme { get; set; } = "Bearer";

    public TimeSpan ClockSkew { get; set; } = TimeSpan.FromMinutes(5);

    public string ResolveAudience() => Audience ?? ClientId ?? string.Empty;

    public string ResolveIssuer() => Authority.TrimEnd('/');
}
