using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Onesign.Api.Data;
using Onesign.Modules.Federation.Domain.Entities;
using Onesign.Modules.Federation.Domain.Enums;
using Onesign.Modules.Federation.Infrastructure.EfCore.Repositories;
using Xunit;

namespace Onesign.Api.Tests.Federation;

public class OidcFederationProviderRepositoryTests
{
    private OnesignDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new OnesignDbContext(options);
    }

    [Fact]
    public async Task AddAsync_ValidProvider_CreatesSuccessfully()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new OidcFederationProviderRepository(context);
        var tenantId = Guid.NewGuid();

        var provider = new OidcFederationProvider
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Azure AD Provider",
            ProviderType = FederationProviderType.AzureAD,
            Authority = "https://login.microsoftonline.com/tenant-id",
            ClientId = "client-id",
            ClientSecret = "client-secret",
            Scopes = "openid profile email",
            Enabled = true,
            CreatedAt = DateTime.UtcNow
        };

        // Act
        var result = await repository.AddAsync(provider, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("Azure AD Provider");
        result.ProviderType.Should().Be(FederationProviderType.AzureAD);
        result.Authority.Should().Be("https://login.microsoftonline.com/tenant-id");
        result.Enabled.Should().BeTrue();
    }

    [Fact]
    public async Task GetByIdAsync_ExistingProvider_ReturnsProvider()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new OidcFederationProviderRepository(context);
        var tenantId = Guid.NewGuid();
        var providerId = Guid.NewGuid();

        var provider = new OidcFederationProvider
        {
            Id = providerId,
            TenantId = tenantId,
            Name = "Google Provider",
            ProviderType = FederationProviderType.Google,
            Authority = "https://accounts.google.com",
            ClientId = "google-client-id",
            ClientSecret = "google-secret",
            Scopes = "openid profile email",
            Enabled = true,
            CreatedAt = DateTime.UtcNow
        };

        await repository.AddAsync(provider, CancellationToken.None);

        // Act
        var result = await repository.GetByIdAsync(providerId, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(providerId);
        result.Name.Should().Be("Google Provider");
        result.ProviderType.Should().Be(FederationProviderType.Google);
    }

    [Fact]
    public async Task GetByIdAsync_NonExistingProvider_ReturnsNull()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new OidcFederationProviderRepository(context);

        // Act
        var result = await repository.GetByIdAsync(Guid.NewGuid(), CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByTenantIdAsync_MultipleProviders_ReturnsAllForTenant()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new OidcFederationProviderRepository(context);
        var tenantId = Guid.NewGuid();

        var provider1 = new OidcFederationProvider
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Azure AD",
            ProviderType = FederationProviderType.AzureAD,
            Authority = "https://login.microsoftonline.com/tenant1",
            ClientId = "azure-client",
            ClientSecret = "azure-secret",
            Scopes = "openid profile email",
            Enabled = true,
            CreatedAt = DateTime.UtcNow
        };

        var provider2 = new OidcFederationProvider
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Google",
            ProviderType = FederationProviderType.Google,
            Authority = "https://accounts.google.com",
            ClientId = "google-client",
            ClientSecret = "google-secret",
            Scopes = "openid profile email",
            Enabled = true,
            CreatedAt = DateTime.UtcNow
        };

        await repository.AddAsync(provider1, CancellationToken.None);
        await repository.AddAsync(provider2, CancellationToken.None);

        // Act
        var results = await repository.GetByTenantIdAsync(tenantId, CancellationToken.None);

        // Assert
        results.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetByTenantIdAsync_NoProviders_ReturnsEmptyList()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new OidcFederationProviderRepository(context);

        // Act
        var results = await repository.GetByTenantIdAsync(Guid.NewGuid(), CancellationToken.None);

        // Assert
        results.Should().BeEmpty();
    }

    [Fact]
    public async Task GetByTenantIdAsync_DifferentTenants_ReturnsOnlyRequestedTenant()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new OidcFederationProviderRepository(context);
        var tenantId1 = Guid.NewGuid();
        var tenantId2 = Guid.NewGuid();

        var provider1 = new OidcFederationProvider
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId1,
            Name = "Tenant 1 Provider",
            ProviderType = FederationProviderType.AzureAD,
            Authority = "https://login.microsoftonline.com/tenant1",
            ClientId = "client1",
            ClientSecret = "secret1",
            Scopes = "openid",
            Enabled = true,
            CreatedAt = DateTime.UtcNow
        };

        var provider2 = new OidcFederationProvider
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId2,
            Name = "Tenant 2 Provider",
            ProviderType = FederationProviderType.Google,
            Authority = "https://accounts.google.com",
            ClientId = "client2",
            ClientSecret = "secret2",
            Scopes = "openid",
            Enabled = true,
            CreatedAt = DateTime.UtcNow
        };

        await repository.AddAsync(provider1, CancellationToken.None);
        await repository.AddAsync(provider2, CancellationToken.None);

        // Act
        var results = await repository.GetByTenantIdAsync(tenantId1, CancellationToken.None);

        // Assert
        results.Should().HaveCount(1);
        results[0].TenantId.Should().Be(tenantId1);
    }

    [Fact]
    public async Task UpdateAsync_ExistingProvider_UpdatesSuccessfully()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new OidcFederationProviderRepository(context);
        var tenantId = Guid.NewGuid();
        var providerId = Guid.NewGuid();

        var provider = new OidcFederationProvider
        {
            Id = providerId,
            TenantId = tenantId,
            Name = "Original Name",
            ProviderType = FederationProviderType.AzureAD,
            Authority = "https://login.microsoftonline.com/original",
            ClientId = "original-client",
            ClientSecret = "original-secret",
            Scopes = "openid profile email",
            Enabled = true,
            CreatedAt = DateTime.UtcNow.AddDays(-10)
        };

        await repository.AddAsync(provider, CancellationToken.None);

        // Modify the provider
        provider.Update(
            "Updated Name",
            "https://login.microsoftonline.com/updated",
            "updated-client",
            "updated-secret",
            "openid profile email groups",
            false
        );

        // Act
        await repository.UpdateAsync(provider, CancellationToken.None);

        // Retrieve and verify
        var updated = await repository.GetByIdAsync(providerId, CancellationToken.None);

        // Assert
        updated.Should().NotBeNull();
        updated!.Name.Should().Be("Updated Name");
        updated.Authority.Should().Be("https://login.microsoftonline.com/updated");
        updated.ClientId.Should().Be("updated-client");
        updated.ClientSecret.Should().Be("updated-secret");
        updated.Scopes.Should().Be("openid profile email groups");
        updated.Enabled.Should().BeFalse();
        updated.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public async Task DeleteAsync_ExistingProvider_DeletesSuccessfully()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new OidcFederationProviderRepository(context);
        var tenantId = Guid.NewGuid();
        var providerId = Guid.NewGuid();

        var provider = new OidcFederationProvider
        {
            Id = providerId,
            TenantId = tenantId,
            Name = "Provider to Delete",
            ProviderType = FederationProviderType.Okta,
            Authority = "https://company.okta.com",
            ClientId = "client",
            ClientSecret = "secret",
            Scopes = "openid",
            Enabled = true,
            CreatedAt = DateTime.UtcNow
        };

        await repository.AddAsync(provider, CancellationToken.None);

        // Act
        await repository.DeleteAsync(providerId, CancellationToken.None);

        // Verify deletion
        var deleted = await repository.GetByIdAsync(providerId, CancellationToken.None);

        // Assert
        deleted.Should().BeNull();
    }

    [Fact]
    public async Task DeleteAsync_NonExistingProvider_DoesNotThrow()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new OidcFederationProviderRepository(context);

        // Act & Assert - Should not throw
        await repository.Invoking(r => r.DeleteAsync(Guid.NewGuid(), CancellationToken.None))
            .Should().NotThrowAsync();
    }

    [Fact]
    public async Task AddAsync_AllProviderTypes_CreatesSuccessfully()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new OidcFederationProviderRepository(context);
        var tenantId = Guid.NewGuid();

        var providers = new[]
        {
            new OidcFederationProvider
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Name = "Azure AD",
                ProviderType = FederationProviderType.AzureAD,
                Authority = "https://login.microsoftonline.com/tenant",
                ClientId = "azure-client",
                ClientSecret = "secret",
                Scopes = "openid",
                Enabled = true,
                CreatedAt = DateTime.UtcNow
            },
            new OidcFederationProvider
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Name = "Google",
                ProviderType = FederationProviderType.Google,
                Authority = "https://accounts.google.com",
                ClientId = "google-client",
                ClientSecret = "secret",
                Scopes = "openid",
                Enabled = true,
                CreatedAt = DateTime.UtcNow
            },
            new OidcFederationProvider
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Name = "Okta",
                ProviderType = FederationProviderType.Okta,
                Authority = "https://company.okta.com",
                ClientId = "okta-client",
                ClientSecret = "secret",
                Scopes = "openid",
                Enabled = true,
                CreatedAt = DateTime.UtcNow
            },
            new OidcFederationProvider
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Name = "Generic OIDC",
                ProviderType = FederationProviderType.GenericOidc,
                Authority = "https://custom.oidc.provider",
                ClientId = "generic-client",
                ClientSecret = "secret",
                Scopes = "openid",
                Enabled = true,
                CreatedAt = DateTime.UtcNow
            }
        };

        // Act
        foreach (var provider in providers)
        {
            await repository.AddAsync(provider, CancellationToken.None);
        }

        var results = await repository.GetByTenantIdAsync(tenantId, CancellationToken.None);

        // Assert
        results.Should().HaveCount(4);
        results.Select(p => p.ProviderType).Should().Contain(FederationProviderType.AzureAD);
        results.Select(p => p.ProviderType).Should().Contain(FederationProviderType.Google);
        results.Select(p => p.ProviderType).Should().Contain(FederationProviderType.Okta);
        results.Select(p => p.ProviderType).Should().Contain(FederationProviderType.GenericOidc);
    }
}
