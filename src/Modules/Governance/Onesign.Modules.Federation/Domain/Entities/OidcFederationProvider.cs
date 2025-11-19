using Onesign.Modules.Federation.Domain.Enums;

namespace Onesign.Modules.Federation.Domain.Entities;

public class OidcFederationProvider
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public FederationProviderType ProviderType { get; set; }
    public string Authority { get; set; } = string.Empty;
    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
    public string Scopes { get; set; } = "openid profile email";
    public bool Enabled { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public void Update(string name, string authority, string clientId, string clientSecret, string scopes, bool enabled)
    {
        Name = name;
        Authority = authority;
        ClientId = clientId;
        ClientSecret = clientSecret;
        Scopes = scopes;
        Enabled = enabled;
        UpdatedAt = DateTime.UtcNow;
    }
}
