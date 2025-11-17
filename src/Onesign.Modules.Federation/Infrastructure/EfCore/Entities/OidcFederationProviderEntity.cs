using Onesign.Modules.Federation.Domain.Entities;
using Onesign.Modules.Federation.Domain.Enums;

namespace Onesign.Modules.Federation.Infrastructure.EfCore.Entities;

public class OidcFederationProviderEntity
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

    public OidcFederationProvider ToDomain()
    {
        return new OidcFederationProvider
        {
            Id = Id,
            TenantId = TenantId,
            Name = Name,
            ProviderType = ProviderType,
            Authority = Authority,
            ClientId = ClientId,
            ClientSecret = ClientSecret,
            Scopes = Scopes,
            Enabled = Enabled,
            CreatedAt = CreatedAt,
            UpdatedAt = UpdatedAt
        };
    }

    public static OidcFederationProviderEntity FromDomain(OidcFederationProvider provider)
    {
        return new OidcFederationProviderEntity
        {
            Id = provider.Id,
            TenantId = provider.TenantId,
            Name = provider.Name,
            ProviderType = provider.ProviderType,
            Authority = provider.Authority,
            ClientId = provider.ClientId,
            ClientSecret = provider.ClientSecret,
            Scopes = provider.Scopes,
            Enabled = provider.Enabled,
            CreatedAt = provider.CreatedAt,
            UpdatedAt = provider.UpdatedAt
        };
    }
}
