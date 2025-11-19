using System.Text.Json.Serialization;

namespace Onesign.Sdk.DotNet.Models;

public class Tenant
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("displayName")]
    public string DisplayName { get; set; } = string.Empty;

    [JsonPropertyName("domain")]
    public string? Domain { get; set; }

    [JsonPropertyName("logoUrl")]
    public string? LogoUrl { get; set; }

    [JsonPropertyName("primaryColor")]
    public string? PrimaryColor { get; set; }

    [JsonPropertyName("enabled")]
    public bool Enabled { get; set; } = true;

    [JsonPropertyName("status")]
    public string? Status { get; set; }

    [JsonPropertyName("plan")]
    public string? Plan { get; set; }

    [JsonPropertyName("region")]
    public string? Region { get; set; }

    [JsonPropertyName("settings")]
    public Dictionary<string, string>? Settings { get; set; }

    [JsonPropertyName("createdAt")]
    public DateTimeOffset CreatedAt { get; set; }

    [JsonPropertyName("updatedAt")]
    public DateTimeOffset? UpdatedAt { get; set; }
}

public class TenantSettings
{
    [JsonPropertyName("allowSelfRegistration")]
    public bool AllowSelfRegistration { get; set; } = true;

    [JsonPropertyName("requireEmailConfirmation")]
    public bool RequireEmailConfirmation { get; set; } = true;

    [JsonPropertyName("requireMfa")]
    public bool RequireMfa { get; set; } = false;

    [JsonPropertyName("passwordPolicy")]
    public PasswordPolicy PasswordPolicy { get; set; } = new();

    [JsonPropertyName("sessionLifetime")]
    public int SessionLifetimeMinutes { get; set; } = 60;

    [JsonPropertyName("refreshTokenLifetime")]
    public int RefreshTokenLifetimeDays { get; set; } = 30;
}

public class PasswordPolicy
{
    [JsonPropertyName("minLength")]
    public int MinLength { get; set; } = 8;

    [JsonPropertyName("requireUppercase")]
    public bool RequireUppercase { get; set; } = true;

    [JsonPropertyName("requireLowercase")]
    public bool RequireLowercase { get; set; } = true;

    [JsonPropertyName("requireDigit")]
    public bool RequireDigit { get; set; } = true;

    [JsonPropertyName("requireNonAlphanumeric")]
    public bool RequireNonAlphanumeric { get; set; } = false;
}

public class CreateTenantRequest
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("plan")]
    public string? Plan { get; set; }

    [JsonPropertyName("region")]
    public string? Region { get; set; }
}

public class UpdateTenantRequest
{
    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("plan")]
    public string? Plan { get; set; }

    [JsonPropertyName("status")]
    public string? Status { get; set; }

    [JsonPropertyName("settings")]
    public Dictionary<string, string>? Settings { get; set; }
}

public class UpdateTenantSettingsRequest
{
    [JsonPropertyName("displayName")]
    public string? DisplayName { get; set; }

    [JsonPropertyName("domain")]
    public string? Domain { get; set; }

    [JsonPropertyName("logoUrl")]
    public string? LogoUrl { get; set; }

    [JsonPropertyName("primaryColor")]
    public string? PrimaryColor { get; set; }

    [JsonPropertyName("settings")]
    public TenantSettings? Settings { get; set; }
}
