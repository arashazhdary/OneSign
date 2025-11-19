using Onesign.Modules.Federation.Domain.Enums;

namespace Onesign.Modules.Federation.Application.DTOs;

public class OidcFederationProviderDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public FederationProviderType ProviderType { get; set; }
    public string Authority { get; set; } = string.Empty;
    public string ClientId { get; set; } = string.Empty;
    public string Scopes { get; set; } = "openid profile email";
    public bool Enabled { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
