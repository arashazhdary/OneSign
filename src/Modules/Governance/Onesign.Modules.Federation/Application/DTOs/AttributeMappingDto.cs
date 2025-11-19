using Onesign.Modules.Federation.Domain.Enums;

namespace Onesign.Modules.Federation.Application.DTOs;

public class AttributeMappingDto
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
}
