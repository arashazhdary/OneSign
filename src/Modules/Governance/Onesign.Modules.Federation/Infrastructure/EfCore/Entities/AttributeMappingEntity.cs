using Onesign.Modules.Federation.Domain.Entities;
using Onesign.Modules.Federation.Domain.Enums;

namespace Onesign.Modules.Federation.Infrastructure.EfCore.Entities;

public class AttributeMappingEntity
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid? SamlProviderId { get; set; }
    public Guid? OidcFederationProviderId { get; set; }
    public string InternalAttributeName { get; set; } = string.Empty;
    public AttributeMappingType MappingType { get; set; }
    public string ExternalAttributeName { get; set; } = string.Empty;
    public string? StaticValue { get; set; }
    public string? TemplateExpression { get; set; }
    public bool IsRequired { get; set; }
    public DateTime CreatedAt { get; set; }

    public AttributeMapping ToDomain()
    {
        return new AttributeMapping
        {
            Id = Id,
            TenantId = TenantId,
            SamlProviderId = SamlProviderId,
            OidcFederationProviderId = OidcFederationProviderId,
            InternalAttributeName = InternalAttributeName,
            MappingType = MappingType,
            ExternalAttributeName = ExternalAttributeName,
            StaticValue = StaticValue,
            TemplateExpression = TemplateExpression,
            IsRequired = IsRequired,
            CreatedAt = CreatedAt
        };
    }

    public static AttributeMappingEntity FromDomain(AttributeMapping mapping)
    {
        return new AttributeMappingEntity
        {
            Id = mapping.Id,
            TenantId = mapping.TenantId,
            SamlProviderId = mapping.SamlProviderId,
            OidcFederationProviderId = mapping.OidcFederationProviderId,
            InternalAttributeName = mapping.InternalAttributeName,
            MappingType = mapping.MappingType,
            ExternalAttributeName = mapping.ExternalAttributeName,
            StaticValue = mapping.StaticValue,
            TemplateExpression = mapping.TemplateExpression,
            IsRequired = mapping.IsRequired,
            CreatedAt = mapping.CreatedAt
        };
    }
}
