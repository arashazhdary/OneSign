using FluentAssertions;
using Onesign.Modules.Federation.Domain.Entities;
using Onesign.Modules.Federation.Domain.Enums;
using Xunit;

namespace Onesign.Api.Tests.Federation;

public class AttributeMappingEntityTests
{
    [Fact]
    public void Constructor_CreatesMappingWithDefaultValues()
    {
        // Act
        var mapping = new AttributeMapping();

        // Assert
        mapping.Id.Should().Be(Guid.Empty);
        mapping.TenantId.Should().Be(Guid.Empty);
        mapping.SamlProviderId.Should().BeNull();
        mapping.OidcFederationProviderId.Should().BeNull();
        mapping.InternalAttributeName.Should().BeEmpty();
        mapping.ExternalAttributeName.Should().BeEmpty();
        mapping.StaticValue.Should().BeNull();
        mapping.TemplateExpression.Should().BeNull();
        mapping.IsRequired.Should().BeFalse();
    }

    [Fact]
    public void SetProperties_AllPropertiesCanBeSet()
    {
        // Arrange
        var id = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var samlProviderId = Guid.NewGuid();
        var createdAt = DateTime.UtcNow;

        // Act
        var mapping = new AttributeMapping
        {
            Id = id,
            TenantId = tenantId,
            SamlProviderId = samlProviderId,
            OidcFederationProviderId = null,
            InternalAttributeName = "email",
            MappingType = AttributeMappingType.ClaimMapping,
            ExternalAttributeName = "urn:oid:1.2.3.4.5.6.7",
            StaticValue = null,
            TemplateExpression = null,
            IsRequired = true,
            CreatedAt = createdAt
        };

        // Assert
        mapping.Id.Should().Be(id);
        mapping.TenantId.Should().Be(tenantId);
        mapping.SamlProviderId.Should().Be(samlProviderId);
        mapping.OidcFederationProviderId.Should().BeNull();
        mapping.InternalAttributeName.Should().Be("email");
        mapping.MappingType.Should().Be(AttributeMappingType.ClaimMapping);
        mapping.ExternalAttributeName.Should().Be("urn:oid:1.2.3.4.5.6.7");
        mapping.StaticValue.Should().BeNull();
        mapping.TemplateExpression.Should().BeNull();
        mapping.IsRequired.Should().BeTrue();
        mapping.CreatedAt.Should().Be(createdAt);
    }

    [Fact]
    public void Update_ValidParameters_UpdatesAllFields()
    {
        // Arrange
        var mapping = new AttributeMapping
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            SamlProviderId = Guid.NewGuid(),
            InternalAttributeName = "original_name",
            MappingType = AttributeMappingType.Static,
            ExternalAttributeName = "original_external",
            StaticValue = "original_value",
            TemplateExpression = null,
            IsRequired = false,
            CreatedAt = DateTime.UtcNow.AddDays(-10)
        };

        // Act
        mapping.Update(
            "updated_name",
            AttributeMappingType.ClaimMapping,
            "updated_external",
            null,
            null,
            true
        );

        // Assert
        mapping.InternalAttributeName.Should().Be("updated_name");
        mapping.MappingType.Should().Be(AttributeMappingType.ClaimMapping);
        mapping.ExternalAttributeName.Should().Be("updated_external");
        mapping.StaticValue.Should().BeNull();
        mapping.TemplateExpression.Should().BeNull();
        mapping.IsRequired.Should().BeTrue();
    }

    [Fact]
    public void Update_DoesNotChangeImmutableFields()
    {
        // Arrange
        var id = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var samlProviderId = Guid.NewGuid();
        var createdAt = DateTime.UtcNow.AddDays(-10);

        var mapping = new AttributeMapping
        {
            Id = id,
            TenantId = tenantId,
            SamlProviderId = samlProviderId,
            InternalAttributeName = "original",
            MappingType = AttributeMappingType.Static,
            ExternalAttributeName = "external",
            StaticValue = "value",
            IsRequired = false,
            CreatedAt = createdAt
        };

        // Act
        mapping.Update(
            "updated",
            AttributeMappingType.ClaimMapping,
            "new_external",
            null,
            null,
            true
        );

        // Assert - Immutable fields should remain unchanged
        mapping.Id.Should().Be(id);
        mapping.TenantId.Should().Be(tenantId);
        mapping.SamlProviderId.Should().Be(samlProviderId);
        mapping.CreatedAt.Should().Be(createdAt);
    }

    [Fact]
    public void AllMappingTypes_CanBeAssigned()
    {
        // Arrange & Act & Assert
        var staticMapping = new AttributeMapping { MappingType = AttributeMappingType.Static };
        staticMapping.MappingType.Should().Be(AttributeMappingType.Static);

        var claimMapping = new AttributeMapping { MappingType = AttributeMappingType.ClaimMapping };
        claimMapping.MappingType.Should().Be(AttributeMappingType.ClaimMapping);

        var templateMapping = new AttributeMapping { MappingType = AttributeMappingType.Template };
        templateMapping.MappingType.Should().Be(AttributeMappingType.Template);
    }

    [Fact]
    public void StaticMappingType_CanHaveStaticValue()
    {
        // Arrange
        var mapping = new AttributeMapping
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            SamlProviderId = Guid.NewGuid(),
            InternalAttributeName = "department",
            MappingType = AttributeMappingType.Static,
            ExternalAttributeName = "",
            StaticValue = "Engineering",
            TemplateExpression = null,
            IsRequired = false,
            CreatedAt = DateTime.UtcNow
        };

        // Assert
        mapping.MappingType.Should().Be(AttributeMappingType.Static);
        mapping.StaticValue.Should().Be("Engineering");
    }

    [Fact]
    public void TemplateMappingType_CanHaveTemplateExpression()
    {
        // Arrange
        var templateExpression = "${firstName} ${lastName}@${domain}";
        var mapping = new AttributeMapping
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            OidcFederationProviderId = Guid.NewGuid(),
            InternalAttributeName = "email",
            MappingType = AttributeMappingType.Template,
            ExternalAttributeName = "",
            StaticValue = null,
            TemplateExpression = templateExpression,
            IsRequired = true,
            CreatedAt = DateTime.UtcNow
        };

        // Assert
        mapping.MappingType.Should().Be(AttributeMappingType.Template);
        mapping.TemplateExpression.Should().Be(templateExpression);
    }

    [Fact]
    public void ClaimMappingType_MapsExternalToInternalAttribute()
    {
        // Arrange
        var mapping = new AttributeMapping
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            SamlProviderId = Guid.NewGuid(),
            InternalAttributeName = "email",
            MappingType = AttributeMappingType.ClaimMapping,
            ExternalAttributeName = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
            StaticValue = null,
            TemplateExpression = null,
            IsRequired = true,
            CreatedAt = DateTime.UtcNow
        };

        // Assert
        mapping.MappingType.Should().Be(AttributeMappingType.ClaimMapping);
        mapping.InternalAttributeName.Should().Be("email");
        mapping.ExternalAttributeName.Should().Contain("emailaddress");
    }

    [Fact]
    public void Update_ChangeFromStaticToClaimMapping_UpdatesCorrectly()
    {
        // Arrange
        var mapping = new AttributeMapping
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            SamlProviderId = Guid.NewGuid(),
            InternalAttributeName = "department",
            MappingType = AttributeMappingType.Static,
            ExternalAttributeName = "",
            StaticValue = "Engineering",
            TemplateExpression = null,
            IsRequired = false,
            CreatedAt = DateTime.UtcNow
        };

        // Act
        mapping.Update(
            "department",
            AttributeMappingType.ClaimMapping,
            "urn:oid:2.5.4.10",
            null,
            null,
            true
        );

        // Assert
        mapping.MappingType.Should().Be(AttributeMappingType.ClaimMapping);
        mapping.ExternalAttributeName.Should().Be("urn:oid:2.5.4.10");
        mapping.StaticValue.Should().BeNull();
    }

    [Fact]
    public void Update_ChangeFromClaimMappingToTemplate_UpdatesCorrectly()
    {
        // Arrange
        var mapping = new AttributeMapping
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            OidcFederationProviderId = Guid.NewGuid(),
            InternalAttributeName = "displayName",
            MappingType = AttributeMappingType.ClaimMapping,
            ExternalAttributeName = "name",
            StaticValue = null,
            TemplateExpression = null,
            IsRequired = true,
            CreatedAt = DateTime.UtcNow
        };

        // Act
        mapping.Update(
            "displayName",
            AttributeMappingType.Template,
            "",
            null,
            "${givenName} ${familyName}",
            true
        );

        // Assert
        mapping.MappingType.Should().Be(AttributeMappingType.Template);
        mapping.TemplateExpression.Should().Be("${givenName} ${familyName}");
        mapping.ExternalAttributeName.Should().BeEmpty();
    }

    [Fact]
    public void SamlAndOidcProviderIds_AreMutuallyExclusive()
    {
        // Arrange - SAML provider
        var samlMapping = new AttributeMapping
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            SamlProviderId = Guid.NewGuid(),
            OidcFederationProviderId = null,
            InternalAttributeName = "email",
            MappingType = AttributeMappingType.ClaimMapping,
            ExternalAttributeName = "emailaddress",
            IsRequired = true,
            CreatedAt = DateTime.UtcNow
        };

        // Arrange - OIDC provider
        var oidcMapping = new AttributeMapping
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            SamlProviderId = null,
            OidcFederationProviderId = Guid.NewGuid(),
            InternalAttributeName = "email",
            MappingType = AttributeMappingType.ClaimMapping,
            ExternalAttributeName = "email",
            IsRequired = true,
            CreatedAt = DateTime.UtcNow
        };

        // Assert
        samlMapping.SamlProviderId.Should().NotBeNull();
        samlMapping.OidcFederationProviderId.Should().BeNull();
        oidcMapping.SamlProviderId.Should().BeNull();
        oidcMapping.OidcFederationProviderId.Should().NotBeNull();
    }

    [Fact]
    public void Update_ToggleIsRequired_UpdatesCorrectly()
    {
        // Arrange
        var mapping = new AttributeMapping
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            SamlProviderId = Guid.NewGuid(),
            InternalAttributeName = "phone",
            MappingType = AttributeMappingType.ClaimMapping,
            ExternalAttributeName = "mobile",
            IsRequired = false,
            CreatedAt = DateTime.UtcNow
        };

        // Act
        mapping.Update(
            "phone",
            AttributeMappingType.ClaimMapping,
            "mobile",
            null,
            null,
            true
        );

        // Assert
        mapping.IsRequired.Should().BeTrue();

        // Act - Toggle back
        mapping.Update(
            "phone",
            AttributeMappingType.ClaimMapping,
            "mobile",
            null,
            null,
            false
        );

        // Assert
        mapping.IsRequired.Should().BeFalse();
    }

    [Fact]
    public void MultipleMappings_HaveIndependentState()
    {
        // Arrange
        var mapping1 = new AttributeMapping
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            SamlProviderId = Guid.NewGuid(),
            InternalAttributeName = "email",
            MappingType = AttributeMappingType.ClaimMapping,
            ExternalAttributeName = "emailaddress",
            IsRequired = true,
            CreatedAt = DateTime.UtcNow
        };

        var mapping2 = new AttributeMapping
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            SamlProviderId = Guid.NewGuid(),
            InternalAttributeName = "name",
            MappingType = AttributeMappingType.Static,
            ExternalAttributeName = "",
            StaticValue = "Default Name",
            IsRequired = false,
            CreatedAt = DateTime.UtcNow
        };

        // Act
        mapping1.Update("email", AttributeMappingType.Template, "", null, "${given} ${family}", true);

        // Assert
        mapping1.MappingType.Should().Be(AttributeMappingType.Template);
        mapping2.MappingType.Should().Be(AttributeMappingType.Static);
        mapping1.Id.Should().NotBe(mapping2.Id);
    }

    [Fact]
    public void ComplexTemplateExpression_CanBeStored()
    {
        // Arrange
        var complexTemplate = @"${if(attr1)}${attr1}${else}${attr2}${endif}@${domain.substring(0,10)}";
        var mapping = new AttributeMapping
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            OidcFederationProviderId = Guid.NewGuid(),
            InternalAttributeName = "email",
            MappingType = AttributeMappingType.Template,
            ExternalAttributeName = "",
            TemplateExpression = complexTemplate,
            IsRequired = true,
            CreatedAt = DateTime.UtcNow
        };

        // Assert
        mapping.TemplateExpression.Should().Be(complexTemplate);
    }

    [Fact]
    public void LongExternalAttributeName_CanBeStored()
    {
        // Arrange
        var longAttributeName = "http://schemas.microsoft.com/identity/claims/objectidentifier";
        var mapping = new AttributeMapping
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            OidcFederationProviderId = Guid.NewGuid(),
            InternalAttributeName = "objectId",
            MappingType = AttributeMappingType.ClaimMapping,
            ExternalAttributeName = longAttributeName,
            IsRequired = false,
            CreatedAt = DateTime.UtcNow
        };

        // Assert
        mapping.ExternalAttributeName.Should().Be(longAttributeName);
    }
}
