using FluentAssertions;
using Onesign.Modules.Federation.Domain.Entities;
using Onesign.Modules.Federation.Domain.Enums;
using Xunit;

namespace Onesign.Api.Tests.Federation;

public class OidcFederationProviderEntityTests
{
    [Fact]
    public void Constructor_CreatesProviderWithDefaultValues()
    {
        // Act
        var provider = new OidcFederationProvider();

        // Assert
        provider.Id.Should().Be(Guid.Empty);
        provider.TenantId.Should().Be(Guid.Empty);
        provider.Name.Should().BeEmpty();
        provider.Authority.Should().BeEmpty();
        provider.ClientId.Should().BeEmpty();
        provider.ClientSecret.Should().BeEmpty();
        provider.Scopes.Should().Be("openid profile email");
        provider.Enabled.Should().BeFalse();
        provider.UpdatedAt.Should().BeNull();
    }

    [Fact]
    public void Update_ValidParameters_UpdatesAllFields()
    {
        // Arrange
        var provider = new OidcFederationProvider
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Name = "Original Name",
            ProviderType = FederationProviderType.AzureAD,
            Authority = "https://login.microsoftonline.com/original",
            ClientId = "original-client-id",
            ClientSecret = "original-secret",
            Scopes = "openid profile email",
            Enabled = false,
            CreatedAt = DateTime.UtcNow.AddDays(-10)
        };

        // Act
        var beforeUpdate = DateTime.UtcNow;
        provider.Update(
            "Updated Name",
            "https://login.microsoftonline.com/updated",
            "updated-client-id",
            "updated-secret",
            "openid profile email groups offline_access",
            true
        );
        var afterUpdate = DateTime.UtcNow;

        // Assert
        provider.Name.Should().Be("Updated Name");
        provider.Authority.Should().Be("https://login.microsoftonline.com/updated");
        provider.ClientId.Should().Be("updated-client-id");
        provider.ClientSecret.Should().Be("updated-secret");
        provider.Scopes.Should().Be("openid profile email groups offline_access");
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
        var providerType = FederationProviderType.Google;
        var createdAt = DateTime.UtcNow.AddDays(-10);

        var provider = new OidcFederationProvider
        {
            Id = id,
            TenantId = tenantId,
            Name = "Original",
            ProviderType = providerType,
            Authority = "https://accounts.google.com",
            ClientId = "original-client-id",
            ClientSecret = "original-secret",
            Scopes = "openid profile email",
            Enabled = true,
            CreatedAt = createdAt
        };

        // Act
        provider.Update(
            "Updated",
            "https://updated.authority.com",
            "updated-client-id",
            "updated-secret",
            "openid profile",
            false
        );

        // Assert - Immutable fields should remain unchanged
        provider.Id.Should().Be(id);
        provider.TenantId.Should().Be(tenantId);
        provider.ProviderType.Should().Be(providerType);
        provider.CreatedAt.Should().Be(createdAt);
    }

    [Fact]
    public void Update_MultipleUpdates_UpdatesTimestampEachTime()
    {
        // Arrange
        var provider = new OidcFederationProvider
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Name = "Original",
            ProviderType = FederationProviderType.Okta,
            Authority = "https://company.okta.com",
            ClientId = "client-id",
            ClientSecret = "secret",
            Scopes = "openid",
            Enabled = true,
            CreatedAt = DateTime.UtcNow.AddDays(-10)
        };

        // Act - First update
        provider.Update("Update 1", "https://okta1.com", "client1", "secret1", "openid profile", true);
        var firstUpdateTime = provider.UpdatedAt;

        // Small delay to ensure different timestamps
        Thread.Sleep(10);

        // Act - Second update
        provider.Update("Update 2", "https://okta2.com", "client2", "secret2", "openid email", false);
        var secondUpdateTime = provider.UpdatedAt;

        // Assert
        firstUpdateTime.Should().NotBeNull();
        secondUpdateTime.Should().NotBeNull();
        secondUpdateTime.Should().BeAfter(firstUpdateTime!.Value);
    }

    [Fact]
    public void Update_ChangeClientCredentials_UpdatesCorrectly()
    {
        // Arrange
        var provider = new OidcFederationProvider
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Name = "Credentials Test",
            ProviderType = FederationProviderType.AzureAD,
            Authority = "https://login.microsoftonline.com/tenant",
            ClientId = "old-client-id",
            ClientSecret = "old-secret",
            Scopes = "openid profile email",
            Enabled = true,
            CreatedAt = DateTime.UtcNow
        };

        // Act
        provider.Update(
            "Credentials Test",
            "https://login.microsoftonline.com/tenant",
            "new-client-id",
            "new-super-secret",
            "openid profile email",
            true
        );

        // Assert
        provider.ClientId.Should().Be("new-client-id");
        provider.ClientSecret.Should().Be("new-super-secret");
    }

    [Fact]
    public void Update_DisableProvider_SetsEnabledToFalse()
    {
        // Arrange
        var provider = new OidcFederationProvider
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Name = "Active Provider",
            ProviderType = FederationProviderType.Google,
            Authority = "https://accounts.google.com",
            ClientId = "client-id",
            ClientSecret = "secret",
            Scopes = "openid profile email",
            Enabled = true,
            CreatedAt = DateTime.UtcNow
        };

        // Act
        provider.Update(
            "Disabled Provider",
            "https://accounts.google.com",
            "client-id",
            "secret",
            "openid profile email",
            false
        );

        // Assert
        provider.Enabled.Should().BeFalse();
    }

    [Fact]
    public void Update_EnableProvider_SetsEnabledToTrue()
    {
        // Arrange
        var provider = new OidcFederationProvider
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Name = "Disabled Provider",
            ProviderType = FederationProviderType.Okta,
            Authority = "https://company.okta.com",
            ClientId = "client-id",
            ClientSecret = "secret",
            Scopes = "openid profile email",
            Enabled = false,
            CreatedAt = DateTime.UtcNow
        };

        // Act
        provider.Update(
            "Enabled Provider",
            "https://company.okta.com",
            "client-id",
            "secret",
            "openid profile email",
            true
        );

        // Assert
        provider.Enabled.Should().BeTrue();
    }

    [Fact]
    public void Update_ChangeScopes_UpdatesCorrectly()
    {
        // Arrange
        var provider = new OidcFederationProvider
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Name = "Scope Test",
            ProviderType = FederationProviderType.AzureAD,
            Authority = "https://login.microsoftonline.com/tenant",
            ClientId = "client-id",
            ClientSecret = "secret",
            Scopes = "openid profile email",
            Enabled = true,
            CreatedAt = DateTime.UtcNow
        };

        // Act
        provider.Update(
            "Scope Test",
            "https://login.microsoftonline.com/tenant",
            "client-id",
            "secret",
            "openid profile email offline_access groups directory.read user.read",
            true
        );

        // Assert
        provider.Scopes.Should().Be("openid profile email offline_access groups directory.read user.read");
    }

    [Fact]
    public void Update_ChangeAuthority_UpdatesCorrectly()
    {
        // Arrange
        var provider = new OidcFederationProvider
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Name = "Authority Test",
            ProviderType = FederationProviderType.GenericOidc,
            Authority = "https://old.authority.com",
            ClientId = "client-id",
            ClientSecret = "secret",
            Scopes = "openid profile",
            Enabled = true,
            CreatedAt = DateTime.UtcNow
        };

        // Act
        provider.Update(
            "Authority Test",
            "https://new.authority.com/.well-known/openid-configuration",
            "client-id",
            "secret",
            "openid profile",
            true
        );

        // Assert
        provider.Authority.Should().Be("https://new.authority.com/.well-known/openid-configuration");
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
        var provider = new OidcFederationProvider
        {
            Id = id,
            TenantId = tenantId,
            Name = "Test Provider",
            ProviderType = FederationProviderType.AzureAD,
            Authority = "https://login.microsoftonline.com/tenant",
            ClientId = "test-client-id",
            ClientSecret = "test-secret",
            Scopes = "openid profile email custom_scope",
            Enabled = true,
            CreatedAt = createdAt,
            UpdatedAt = updatedAt
        };

        // Assert
        provider.Id.Should().Be(id);
        provider.TenantId.Should().Be(tenantId);
        provider.Name.Should().Be("Test Provider");
        provider.ProviderType.Should().Be(FederationProviderType.AzureAD);
        provider.Authority.Should().Be("https://login.microsoftonline.com/tenant");
        provider.ClientId.Should().Be("test-client-id");
        provider.ClientSecret.Should().Be("test-secret");
        provider.Scopes.Should().Be("openid profile email custom_scope");
        provider.Enabled.Should().BeTrue();
        provider.CreatedAt.Should().Be(createdAt);
        provider.UpdatedAt.Should().Be(updatedAt);
    }

    [Fact]
    public void AllProviderTypes_CanBeAssigned()
    {
        // Arrange & Act & Assert
        var azureProvider = new OidcFederationProvider { ProviderType = FederationProviderType.AzureAD };
        azureProvider.ProviderType.Should().Be(FederationProviderType.AzureAD);

        var googleProvider = new OidcFederationProvider { ProviderType = FederationProviderType.Google };
        googleProvider.ProviderType.Should().Be(FederationProviderType.Google);

        var oktaProvider = new OidcFederationProvider { ProviderType = FederationProviderType.Okta };
        oktaProvider.ProviderType.Should().Be(FederationProviderType.Okta);

        var genericProvider = new OidcFederationProvider { ProviderType = FederationProviderType.GenericOidc };
        genericProvider.ProviderType.Should().Be(FederationProviderType.GenericOidc);
    }

    [Fact]
    public void Update_WithEmptySecret_UpdatesCorrectly()
    {
        // Arrange
        var provider = new OidcFederationProvider
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Name = "Secret Test",
            ProviderType = FederationProviderType.AzureAD,
            Authority = "https://login.microsoftonline.com/tenant",
            ClientId = "client-id",
            ClientSecret = "old-secret",
            Scopes = "openid profile email",
            Enabled = true,
            CreatedAt = DateTime.UtcNow
        };

        // Act - This simulates rotating to a public client (no secret)
        provider.Update(
            "Public Client",
            "https://login.microsoftonline.com/tenant",
            "client-id",
            "",
            "openid profile email",
            true
        );

        // Assert
        provider.ClientSecret.Should().BeEmpty();
    }

    [Fact]
    public void Update_PreservesProviderType()
    {
        // Arrange
        var provider = new OidcFederationProvider
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Name = "Original",
            ProviderType = FederationProviderType.Google,
            Authority = "https://accounts.google.com",
            ClientId = "client-id",
            ClientSecret = "secret",
            Scopes = "openid profile email",
            Enabled = true,
            CreatedAt = DateTime.UtcNow
        };

        // Act
        provider.Update(
            "Updated",
            "https://accounts.google.com",
            "new-client-id",
            "new-secret",
            "openid profile email",
            true
        );

        // Assert - ProviderType should remain unchanged
        provider.ProviderType.Should().Be(FederationProviderType.Google);
    }
}
