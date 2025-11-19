using Onesign.Modules.Federation.Domain.Enums;

namespace Onesign.Modules.Federation.Domain.Entities;

public class AttributeMapping
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

    public void Update(string internalAttributeName, AttributeMappingType mappingType,
        string externalAttributeName, string? staticValue, string? templateExpression, bool isRequired)
    {
        InternalAttributeName = internalAttributeName;
        MappingType = mappingType;
        ExternalAttributeName = externalAttributeName;
        StaticValue = staticValue;
        TemplateExpression = templateExpression;
        IsRequired = isRequired;
    }
}
