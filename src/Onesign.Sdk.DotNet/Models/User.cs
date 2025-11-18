using System.Text.Json.Serialization;

namespace Onesign.Sdk.DotNet.Models;

public class User
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    [JsonPropertyName("username")]
    public string? Username { get; set; }

    [JsonPropertyName("firstName")]
    public string? FirstName { get; set; }

    [JsonPropertyName("lastName")]
    public string? LastName { get; set; }

    [JsonPropertyName("phoneNumber")]
    public string? PhoneNumber { get; set; }

    [JsonPropertyName("emailConfirmed")]
    public bool EmailConfirmed { get; set; }

    [JsonPropertyName("phoneNumberConfirmed")]
    public bool PhoneNumberConfirmed { get; set; }

    [JsonPropertyName("twoFactorEnabled")]
    public bool TwoFactorEnabled { get; set; }

    [JsonPropertyName("lockoutEnabled")]
    public bool LockoutEnabled { get; set; }

    [JsonPropertyName("lockoutEnd")]
    public DateTimeOffset? LockoutEnd { get; set; }

    [JsonPropertyName("accessFailedCount")]
    public int AccessFailedCount { get; set; }

    [JsonPropertyName("createdAt")]
    public DateTimeOffset CreatedAt { get; set; }

    [JsonPropertyName("updatedAt")]
    public DateTimeOffset? UpdatedAt { get; set; }

    [JsonPropertyName("roles")]
    public List<string> Roles { get; set; } = new();

    [JsonPropertyName("claims")]
    public Dictionary<string, string> Claims { get; set; } = new();
}

public class CreateUserRequest
{
    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    [JsonPropertyName("password")]
    public string Password { get; set; } = string.Empty;

    [JsonPropertyName("username")]
    public string? Username { get; set; }

    [JsonPropertyName("firstName")]
    public string? FirstName { get; set; }

    [JsonPropertyName("lastName")]
    public string? LastName { get; set; }

    [JsonPropertyName("phoneNumber")]
    public string? PhoneNumber { get; set; }

    [JsonPropertyName("roles")]
    public List<string>? Roles { get; set; }
}

public class UpdateUserRequest
{
    [JsonPropertyName("email")]
    public string? Email { get; set; }

    [JsonPropertyName("username")]
    public string? Username { get; set; }

    [JsonPropertyName("firstName")]
    public string? FirstName { get; set; }

    [JsonPropertyName("lastName")]
    public string? LastName { get; set; }

    [JsonPropertyName("phoneNumber")]
    public string? PhoneNumber { get; set; }

    [JsonPropertyName("roles")]
    public List<string>? Roles { get; set; }
}
