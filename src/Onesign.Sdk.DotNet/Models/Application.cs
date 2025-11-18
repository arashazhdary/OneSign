using System.Text.Json.Serialization;

namespace Onesign.Sdk.DotNet.Models;

public class Application
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("clientId")]
    public string ClientId { get; set; } = string.Empty;

    [JsonPropertyName("displayName")]
    public string DisplayName { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("applicationType")]
    public string ApplicationType { get; set; } = string.Empty;

    [JsonPropertyName("redirectUris")]
    public List<string> RedirectUris { get; set; } = new();

    [JsonPropertyName("postLogoutRedirectUris")]
    public List<string> PostLogoutRedirectUris { get; set; } = new();

    [JsonPropertyName("permissions")]
    public List<string> Permissions { get; set; } = new();

    [JsonPropertyName("consentType")]
    public string? ConsentType { get; set; }

    [JsonPropertyName("enabled")]
    public bool Enabled { get; set; } = true;

    [JsonPropertyName("createdAt")]
    public DateTimeOffset CreatedAt { get; set; }

    [JsonPropertyName("updatedAt")]
    public DateTimeOffset? UpdatedAt { get; set; }
}

public class CreateApplicationRequest
{
    [JsonPropertyName("displayName")]
    public string DisplayName { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("applicationType")]
    public string ApplicationType { get; set; } = "web";

    [JsonPropertyName("redirectUris")]
    public List<string>? RedirectUris { get; set; }

    [JsonPropertyName("postLogoutRedirectUris")]
    public List<string>? PostLogoutRedirectUris { get; set; }

    [JsonPropertyName("permissions")]
    public List<string>? Permissions { get; set; }
}

public class UpdateApplicationRequest
{
    [JsonPropertyName("displayName")]
    public string? DisplayName { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("redirectUris")]
    public List<string>? RedirectUris { get; set; }

    [JsonPropertyName("postLogoutRedirectUris")]
    public List<string>? PostLogoutRedirectUris { get; set; }

    [JsonPropertyName("permissions")]
    public List<string>? Permissions { get; set; }

    [JsonPropertyName("enabled")]
    public bool? Enabled { get; set; }
}
