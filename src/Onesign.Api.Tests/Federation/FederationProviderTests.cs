using Xunit;
using Moq;
using Microsoft.EntityFrameworkCore;
using Onesign.Api.Data;
using Onesign.Modules.Federation.Domain.Entities;
using Onesign.Modules.Federation.Domain.Enums;
using Onesign.Modules.Federation.Infrastructure.EfCore.Repositories;

namespace Onesign.Api.Tests.Federation;

public class FederationProviderTests
{
    private OnesignDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new OnesignDbContext(options);
    }

    [Fact]
    public async Task CreateIdentityProvider_ValidProvider_CreatesSuccessfully()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new IdentityProviderRepository(context);
        var tenantId = Guid.NewGuid();

        var provider = new IdentityProvider
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Azure AD",
            Type = IdentityProviderType.OIDC,
            ClientId = "test-client-id",
            ClientSecret = "test-client-secret",
            AuthorizationEndpoint = "https://login.microsoftonline.com/authorize",
            TokenEndpoint = "https://login.microsoftonline.com/token",
            UserInfoEndpoint = "https://graph.microsoft.com/oidc/userinfo",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        // Act
        var result = await repository.AddAsync(provider, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Azure AD", result.Name);
        Assert.Equal(IdentityProviderType.OIDC, result.Type);
    }

    [Fact]
    public async Task GetIdentityProvidersByTenant_ReturnsProviders()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new IdentityProviderRepository(context);
        var tenantId = Guid.NewGuid();

        var provider1 = new IdentityProvider
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Google",
            Type = IdentityProviderType.OIDC,
            ClientId = "google-client-id",
            ClientSecret = "google-secret",
            AuthorizationEndpoint = "https://accounts.google.com/o/oauth2/v2/auth",
            TokenEndpoint = "https://oauth2.googleapis.com/token",
            UserInfoEndpoint = "https://openidconnect.googleapis.com/v1/userinfo",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var provider2 = new IdentityProvider
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "GitHub",
            Type = IdentityProviderType.OAuth2,
            ClientId = "github-client-id",
            ClientSecret = "github-secret",
            AuthorizationEndpoint = "https://github.com/login/oauth/authorize",
            TokenEndpoint = "https://github.com/login/oauth/access_token",
            UserInfoEndpoint = "https://api.github.com/user",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await repository.AddAsync(provider1, CancellationToken.None);
        await repository.AddAsync(provider2, CancellationToken.None);

        // Act
        var providers = await repository.GetByTenantIdAsync(tenantId, CancellationToken.None);

        // Assert
        Assert.NotNull(providers);
        Assert.Equal(2, providers.Count());
    }

    [Fact]
    public async Task GetActiveProviders_ReturnsOnlyActive()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new IdentityProviderRepository(context);
        var tenantId = Guid.NewGuid();

        var activeProvider = new IdentityProvider
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Active Provider",
            Type = IdentityProviderType.OIDC,
            ClientId = "active-client-id",
            ClientSecret = "active-secret",
            AuthorizationEndpoint = "https://example.com/auth",
            TokenEndpoint = "https://example.com/token",
            UserInfoEndpoint = "https://example.com/userinfo",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var inactiveProvider = new IdentityProvider
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Inactive Provider",
            Type = IdentityProviderType.SAML,
            ClientId = "inactive-client-id",
            ClientSecret = "inactive-secret",
            AuthorizationEndpoint = "https://example2.com/auth",
            TokenEndpoint = "https://example2.com/token",
            UserInfoEndpoint = "https://example2.com/userinfo",
            IsActive = false,
            CreatedAt = DateTime.UtcNow
        };

        await repository.AddAsync(activeProvider, CancellationToken.None);
        await repository.AddAsync(inactiveProvider, CancellationToken.None);

        // Act
        var activeProviders = await repository.GetActiveByTenantIdAsync(tenantId, CancellationToken.None);

        // Assert
        Assert.NotNull(activeProviders);
        Assert.Single(activeProviders);
        Assert.Equal("Active Provider", activeProviders.First().Name);
    }

    [Fact]
    public async Task UpdateIdentityProvider_ValidUpdate_UpdatesSuccessfully()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new IdentityProviderRepository(context);
        var tenantId = Guid.NewGuid();

        var provider = new IdentityProvider
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Original Name",
            Type = IdentityProviderType.OIDC,
            ClientId = "original-client-id",
            ClientSecret = "original-secret",
            AuthorizationEndpoint = "https://example.com/auth",
            TokenEndpoint = "https://example.com/token",
            UserInfoEndpoint = "https://example.com/userinfo",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await repository.AddAsync(provider, CancellationToken.None);

        // Act
        provider.Name = "Updated Name";
        provider.ClientId = "updated-client-id";
        await repository.UpdateAsync(provider, CancellationToken.None);

        var updated = await repository.GetByIdAsync(provider.Id, CancellationToken.None);

        // Assert
        Assert.NotNull(updated);
        Assert.Equal("Updated Name", updated.Name);
        Assert.Equal("updated-client-id", updated.ClientId);
    }
}
