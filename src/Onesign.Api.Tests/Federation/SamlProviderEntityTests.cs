using FluentAssertions;
using Onesign.Modules.Federation.Domain.Entities;
using Onesign.Modules.Federation.Domain.Enums;
using Xunit;

namespace Onesign.Api.Tests.Federation;

public class SamlProviderEntityTests
{
    [Fact]
    public void Constructor_CreatesProviderWithDefaultValues()
    {
        // Act
        var provider = new SamlProvider();

        // Assert
        provider.Id.Should().Be(Guid.Empty);
        provider.TenantId.Should().Be(Guid.Empty);
        provider.Name.Should().BeEmpty();
        provider.EntityId.Should().BeEmpty();
        provider.IdpSsoUrl.Should().BeEmpty();
        provider.IdpCertificate.Should().BeEmpty();
        provider.SpEntityId.Should().BeEmpty();
        provider.SpAssertionConsumerServiceUrl.Should().BeEmpty();
        provider.SignAuthRequest.Should().BeFalse();
        provider.WantAssertionsSigned.Should().BeFalse();
        provider.Enabled.Should().BeFalse();
        provider.UpdatedAt.Should().BeNull();
    }

    [Fact]
    public void Update_ValidParameters_UpdatesAllFields()
    {
        // Arrange
        var provider = new SamlProvider
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Name = "Original Name",
            EntityId = "https://original.idp.com/metadata",
            IdpSsoUrl = "https://original.idp.com/sso",
            IdpCertificate = "OriginalCert",
            SpEntityId = "original-sp",
            SpAssertionConsumerServiceUrl = "https://original.sp.com/acs",
            BindingType = SamlBindingType.HttpPost,
            SignAuthRequest = false,
            WantAssertionsSigned = false,
            Enabled = false,
            CreatedAt = DateTime.UtcNow.AddDays(-10)
        };

        // Act
        var beforeUpdate = DateTime.UtcNow;
        provider.Update(
            "Updated Name",
            "https://updated.idp.com/sso",
            "UpdatedCert",
            SamlBindingType.HttpRedirect,
            true,
            true,
            true
        );
        var afterUpdate = DateTime.UtcNow;

        // Assert
        provider.Name.Should().Be("Updated Name");
        provider.IdpSsoUrl.Should().Be("https://updated.idp.com/sso");
        provider.IdpCertificate.Should().Be("UpdatedCert");
        provider.BindingType.Should().Be(SamlBindingType.HttpRedirect);
        provider.SignAuthRequest.Should().BeTrue();
        provider.WantAssertionsSigned.Should().BeTrue();
        provider.Enabled.Should().BeTrue();
        provider.UpdatedAt.Should().NotBeNull();
        provider.UpdatedAt.Should().BeOnOrAfter(beforeUpdate);
        provider.UpdatedAt.Should().BeOnOrBefore(afterUpdate);
    }

    [Fact]
    public void Update_DoesNotChangeImmutableFields()
    {
        // Arrange
        var id = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var entityId = "https://immutable.idp.com/metadata";
        var spEntityId = "immutable-sp";
        var spAcsUrl = "https://immutable.sp.com/acs";
        var createdAt = DateTime.UtcNow.AddDays(-10);

        var provider = new SamlProvider
        {
            Id = id,
            TenantId = tenantId,
            Name = "Original",
            EntityId = entityId,
            IdpSsoUrl = "https://original.idp.com/sso",
            IdpCertificate = "OriginalCert",
            SpEntityId = spEntityId,
            SpAssertionConsumerServiceUrl = spAcsUrl,
            BindingType = SamlBindingType.HttpPost,
            SignAuthRequest = false,
            WantAssertionsSigned = false,
            Enabled = true,
            CreatedAt = createdAt
        };

        // Act
        provider.Update(
            "Updated",
            "https://updated.idp.com/sso",
            "UpdatedCert",
            SamlBindingType.HttpRedirect,
            true,
            true,
            true
        );

        // Assert - Immutable fields should remain unchanged
        provider.Id.Should().Be(id);
        provider.TenantId.Should().Be(tenantId);
        provider.EntityId.Should().Be(entityId);
        provider.SpEntityId.Should().Be(spEntityId);
        provider.SpAssertionConsumerServiceUrl.Should().Be(spAcsUrl);
        provider.CreatedAt.Should().Be(createdAt);
    }

    [Fact]
    public void Update_MultipleUpdates_UpdatesTimestampEachTime()
    {
        // Arrange
        var provider = new SamlProvider
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Name = "Original",
            EntityId = "https://test.idp.com/metadata",
            IdpSsoUrl = "https://test.idp.com/sso",
            IdpCertificate = "Cert",
            BindingType = SamlBindingType.HttpPost,
            Enabled = true,
            CreatedAt = DateTime.UtcNow.AddDays(-10)
        };

        // Act - First update
        provider.Update("Update 1", "https://sso1.com", "Cert1", SamlBindingType.HttpPost, true, true, true);
        var firstUpdateTime = provider.UpdatedAt;

        // Small delay to ensure different timestamps
        Thread.Sleep(10);

        // Act - Second update
        provider.Update("Update 2", "https://sso2.com", "Cert2", SamlBindingType.HttpRedirect, false, false, false);
        var secondUpdateTime = provider.UpdatedAt;

        // Assert
        firstUpdateTime.Should().NotBeNull();
        secondUpdateTime.Should().NotBeNull();
        secondUpdateTime.Should().BeAfter(firstUpdateTime!.Value);
    }

    [Fact]
    public void Update_ChangeBindingTypeFromPostToRedirect_UpdatesCorrectly()
    {
        // Arrange
        var provider = new SamlProvider
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Name = "HTTP Post Provider",
            EntityId = "https://post.idp.com/metadata",
            IdpSsoUrl = "https://post.idp.com/sso",
            IdpCertificate = "PostCert",
            BindingType = SamlBindingType.HttpPost,
            Enabled = true,
            CreatedAt = DateTime.UtcNow.AddDays(-5)
        };

        // Act
        provider.Update(
            "HTTP Redirect Provider",
            "https://redirect.idp.com/sso",
            "RedirectCert",
            SamlBindingType.HttpRedirect,
            true,
            true,
            true
        );

        // Assert
        provider.BindingType.Should().Be(SamlBindingType.HttpRedirect);
        provider.Name.Should().Be("HTTP Redirect Provider");
    }

    [Fact]
    public void Update_DisableProvider_SetsEnabledToFalse()
    {
        // Arrange
        var provider = new SamlProvider
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Name = "Active Provider",
            EntityId = "https://active.idp.com/metadata",
            IdpSsoUrl = "https://active.idp.com/sso",
            IdpCertificate = "Cert",
            BindingType = SamlBindingType.HttpPost,
            Enabled = true,
            CreatedAt = DateTime.UtcNow
        };

        // Act
        provider.Update(
            "Disabled Provider",
            "https://active.idp.com/sso",
            "Cert",
            SamlBindingType.HttpPost,
            true,
            true,
            false
        );

        // Assert
        provider.Enabled.Should().BeFalse();
    }

    [Fact]
    public void Update_EnableProvider_SetsEnabledToTrue()
    {
        // Arrange
        var provider = new SamlProvider
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Name = "Disabled Provider",
            EntityId = "https://disabled.idp.com/metadata",
            IdpSsoUrl = "https://disabled.idp.com/sso",
            IdpCertificate = "Cert",
            BindingType = SamlBindingType.HttpPost,
            Enabled = false,
            CreatedAt = DateTime.UtcNow
        };

        // Act
        provider.Update(
            "Enabled Provider",
            "https://disabled.idp.com/sso",
            "Cert",
            SamlBindingType.HttpPost,
            true,
            true,
            true
        );

        // Assert
        provider.Enabled.Should().BeTrue();
    }

    [Fact]
    public void Update_ChangeSigningOptions_UpdatesCorrectly()
    {
        // Arrange
        var provider = new SamlProvider
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Name = "Signing Test",
            EntityId = "https://signing.idp.com/metadata",
            IdpSsoUrl = "https://signing.idp.com/sso",
            IdpCertificate = "Cert",
            BindingType = SamlBindingType.HttpPost,
            SignAuthRequest = false,
            WantAssertionsSigned = false,
            Enabled = true,
            CreatedAt = DateTime.UtcNow
        };

        // Act
        provider.Update(
            "Signing Test",
            "https://signing.idp.com/sso",
            "Cert",
            SamlBindingType.HttpPost,
            true,
            true,
            true
        );

        // Assert
        provider.SignAuthRequest.Should().BeTrue();
        provider.WantAssertionsSigned.Should().BeTrue();
    }

    [Fact]
    public void SetProperties_AllPropertiesCanBeSet()
    {
        // Arrange
        var id = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var createdAt = DateTime.UtcNow;
        var updatedAt = DateTime.UtcNow.AddHours(1);

        // Act
        var provider = new SamlProvider
        {
            Id = id,
            TenantId = tenantId,
            Name = "Test Provider",
            EntityId = "https://test.idp.com/metadata",
            IdpSsoUrl = "https://test.idp.com/sso",
            IdpCertificate = "TestCert",
            SpEntityId = "test-sp",
            SpAssertionConsumerServiceUrl = "https://test.sp.com/acs",
            BindingType = SamlBindingType.HttpRedirect,
            SignAuthRequest = true,
            WantAssertionsSigned = true,
            Enabled = true,
            CreatedAt = createdAt,
            UpdatedAt = updatedAt
        };

        // Assert
        provider.Id.Should().Be(id);
        provider.TenantId.Should().Be(tenantId);
        provider.Name.Should().Be("Test Provider");
        provider.EntityId.Should().Be("https://test.idp.com/metadata");
        provider.IdpSsoUrl.Should().Be("https://test.idp.com/sso");
        provider.IdpCertificate.Should().Be("TestCert");
        provider.SpEntityId.Should().Be("test-sp");
        provider.SpAssertionConsumerServiceUrl.Should().Be("https://test.sp.com/acs");
        provider.BindingType.Should().Be(SamlBindingType.HttpRedirect);
        provider.SignAuthRequest.Should().BeTrue();
        provider.WantAssertionsSigned.Should().BeTrue();
        provider.Enabled.Should().BeTrue();
        provider.CreatedAt.Should().Be(createdAt);
        provider.UpdatedAt.Should().Be(updatedAt);
    }
}
