using Onesign.Modules.Federation.Domain.Entities;
using Onesign.Modules.Federation.Domain.Enums;

namespace Onesign.Modules.Federation.Infrastructure.EfCore.Entities;

public class SamlProviderEntity
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public string IdpSsoUrl { get; set; } = string.Empty;
    public string IdpCertificate { get; set; } = string.Empty;
    public string SpEntityId { get; set; } = string.Empty;
    public string SpAssertionConsumerServiceUrl { get; set; } = string.Empty;
    public SamlBindingType BindingType { get; set; }
    public bool SignAuthRequest { get; set; }
    public bool WantAssertionsSigned { get; set; }
    public bool Enabled { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public SamlProvider ToDomain()
    {
        return new SamlProvider
        {
            Id = Id,
            TenantId = TenantId,
            Name = Name,
            EntityId = EntityId,
            IdpSsoUrl = IdpSsoUrl,
            IdpCertificate = IdpCertificate,
            SpEntityId = SpEntityId,
            SpAssertionConsumerServiceUrl = SpAssertionConsumerServiceUrl,
            BindingType = BindingType,
            SignAuthRequest = SignAuthRequest,
            WantAssertionsSigned = WantAssertionsSigned,
            Enabled = Enabled,
            CreatedAt = CreatedAt,
            UpdatedAt = UpdatedAt
        };
    }

    public static SamlProviderEntity FromDomain(SamlProvider provider)
    {
        return new SamlProviderEntity
        {
            Id = provider.Id,
            TenantId = provider.TenantId,
            Name = provider.Name,
            EntityId = provider.EntityId,
            IdpSsoUrl = provider.IdpSsoUrl,
            IdpCertificate = provider.IdpCertificate,
            SpEntityId = provider.SpEntityId,
            SpAssertionConsumerServiceUrl = provider.SpAssertionConsumerServiceUrl,
            BindingType = provider.BindingType,
            SignAuthRequest = provider.SignAuthRequest,
            WantAssertionsSigned = provider.WantAssertionsSigned,
            Enabled = provider.Enabled,
            CreatedAt = provider.CreatedAt,
            UpdatedAt = provider.UpdatedAt
        };
    }
}
