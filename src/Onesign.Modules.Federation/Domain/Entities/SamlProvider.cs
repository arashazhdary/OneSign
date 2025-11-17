using Onesign.Modules.Federation.Domain.Enums;

namespace Onesign.Modules.Federation.Domain.Entities;

public class SamlProvider
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

    public void Update(string name, string idpSsoUrl, string idpCertificate,
        SamlBindingType bindingType, bool signAuthRequest, bool wantAssertionsSigned, bool enabled)
    {
        Name = name;
        IdpSsoUrl = idpSsoUrl;
        IdpCertificate = idpCertificate;
        BindingType = bindingType;
        SignAuthRequest = signAuthRequest;
        WantAssertionsSigned = wantAssertionsSigned;
        Enabled = enabled;
        UpdatedAt = DateTime.UtcNow;
    }
}
