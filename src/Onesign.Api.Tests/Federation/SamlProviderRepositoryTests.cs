using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Onesign.Api.Data;
using Onesign.Modules.Federation.Domain.Entities;
using Onesign.Modules.Federation.Domain.Enums;
using Onesign.Modules.Federation.Infrastructure.EfCore.Repositories;
using Xunit;

namespace Onesign.Api.Tests.Federation;

public class SamlProviderRepositoryTests
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
        var repository = new SamlProviderRepository(context);
        var tenantId = Guid.NewGuid();

        var provider = new SamlProvider
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Test SAML Provider",
            EntityId = "https://idp.example.com/metadata",
            IdpSsoUrl = "https://idp.example.com/sso",
            IdpCertificate = "MIICertificate",
            SpEntityId = $"onesign:{tenantId}:saml",
            SpAssertionConsumerServiceUrl = $"https://login.onesign.com/saml/acs/{tenantId}",
            BindingType = SamlBindingType.HttpPost,
            SignAuthRequest = true,
            WantAssertionsSigned = true,
            Enabled = true,
            CreatedAt = DateTime.UtcNow
        };

        // Act
        var result = await repository.AddAsync(provider, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("Test SAML Provider");
        result.EntityId.Should().Be("https://idp.example.com/metadata");
        result.BindingType.Should().Be(SamlBindingType.HttpPost);
        result.Enabled.Should().BeTrue();
    }

    [Fact]
    public async Task GetByIdAsync_ExistingProvider_ReturnsProvider()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new SamlProviderRepository(context);
        var tenantId = Guid.NewGuid();
        var providerId = Guid.NewGuid();

        var provider = new SamlProvider
        {
            Id = providerId,
            TenantId = tenantId,
            Name = "Test Provider",
            EntityId = "https://idp.example.com/metadata",
            IdpSsoUrl = "https://idp.example.com/sso",
            IdpCertificate = "Cert",
            SpEntityId = "sp",
            SpAssertionConsumerServiceUrl = "https://sp.com/acs",
            BindingType = SamlBindingType.HttpPost,
            Enabled = true,
            CreatedAt = DateTime.UtcNow
        };

        await repository.AddAsync(provider, CancellationToken.None);

        // Act
        var result = await repository.GetByIdAsync(providerId, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(providerId);
        result.Name.Should().Be("Test Provider");
    }

    [Fact]
    public async Task GetByIdAsync_NonExistingProvider_ReturnsNull()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new SamlProviderRepository(context);

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
        var repository = new SamlProviderRepository(context);
        var tenantId = Guid.NewGuid();

        var provider1 = new SamlProvider
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Provider 1",
            EntityId = "https://idp1.example.com/metadata",
            IdpSsoUrl = "https://idp1.example.com/sso",
            IdpCertificate = "Cert1",
            SpEntityId = "sp1",
            SpAssertionConsumerServiceUrl = "https://sp1.com/acs",
            BindingType = SamlBindingType.HttpPost,
            Enabled = true,
            CreatedAt = DateTime.UtcNow
        };

        var provider2 = new SamlProvider
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Provider 2",
            EntityId = "https://idp2.example.com/metadata",
            IdpSsoUrl = "https://idp2.example.com/sso",
            IdpCertificate = "Cert2",
            SpEntityId = "sp2",
            SpAssertionConsumerServiceUrl = "https://sp2.com/acs",
            BindingType = SamlBindingType.HttpRedirect,
            Enabled = false,
            CreatedAt = DateTime.UtcNow
        };

        await repository.AddAsync(provider1, CancellationToken.None);
        await repository.AddAsync(provider2, CancellationToken.None);

        // Act
        var results = await repository.GetByTenantIdAsync(tenantId, CancellationToken.None);

        // Assert
        results.Should().HaveCount(2);
        results.Select(p => p.Name).Should().Contain("Provider 1");
        results.Select(p => p.Name).Should().Contain("Provider 2");
    }

    [Fact]
    public async Task GetByTenantIdAsync_NoProviders_ReturnsEmptyList()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new SamlProviderRepository(context);

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
        var repository = new SamlProviderRepository(context);
        var tenantId1 = Guid.NewGuid();
        var tenantId2 = Guid.NewGuid();

        var provider1 = new SamlProvider
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId1,
            Name = "Tenant 1 Provider",
            EntityId = "https://tenant1.idp.com/metadata",
            IdpSsoUrl = "https://tenant1.idp.com/sso",
            IdpCertificate = "Cert1",
            SpEntityId = "sp1",
            SpAssertionConsumerServiceUrl = "https://sp1.com/acs",
            BindingType = SamlBindingType.HttpPost,
            Enabled = true,
            CreatedAt = DateTime.UtcNow
        };

        var provider2 = new SamlProvider
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId2,
            Name = "Tenant 2 Provider",
            EntityId = "https://tenant2.idp.com/metadata",
            IdpSsoUrl = "https://tenant2.idp.com/sso",
            IdpCertificate = "Cert2",
            SpEntityId = "sp2",
            SpAssertionConsumerServiceUrl = "https://sp2.com/acs",
            BindingType = SamlBindingType.HttpRedirect,
            Enabled = true,
            CreatedAt = DateTime.UtcNow
        };

        await repository.AddAsync(provider1, CancellationToken.None);
        await repository.AddAsync(provider2, CancellationToken.None);

        // Act
        var results = await repository.GetByTenantIdAsync(tenantId1, CancellationToken.None);

        // Assert
        results.Should().HaveCount(1);
        results[0].Name.Should().Be("Tenant 1 Provider");
    }

    [Fact]
    public async Task GetByEntityIdAsync_ExistingEntity_ReturnsProvider()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new SamlProviderRepository(context);
        var tenantId = Guid.NewGuid();
        var entityId = "https://unique.idp.com/metadata";

        var provider = new SamlProvider
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Unique Entity Provider",
            EntityId = entityId,
            IdpSsoUrl = "https://unique.idp.com/sso",
            IdpCertificate = "Cert",
            SpEntityId = "sp",
            SpAssertionConsumerServiceUrl = "https://sp.com/acs",
            BindingType = SamlBindingType.HttpPost,
            Enabled = true,
            CreatedAt = DateTime.UtcNow
        };

        await repository.AddAsync(provider, CancellationToken.None);

        // Act
        var result = await repository.GetByEntityIdAsync(tenantId, entityId, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.EntityId.Should().Be(entityId);
    }

    [Fact]
    public async Task GetByEntityIdAsync_NonExistingEntity_ReturnsNull()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new SamlProviderRepository(context);

        // Act
        var result = await repository.GetByEntityIdAsync(Guid.NewGuid(), "https://nonexistent.idp.com/metadata", CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByEntityIdAsync_SameEntityDifferentTenant_ReturnsNull()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new SamlProviderRepository(context);
        var tenantId1 = Guid.NewGuid();
        var tenantId2 = Guid.NewGuid();
        var entityId = "https://shared.idp.com/metadata";

        var provider = new SamlProvider
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId1,
            Name = "Tenant 1 Provider",
            EntityId = entityId,
            IdpSsoUrl = "https://shared.idp.com/sso",
            IdpCertificate = "Cert",
            SpEntityId = "sp",
            SpAssertionConsumerServiceUrl = "https://sp.com/acs",
            BindingType = SamlBindingType.HttpPost,
            Enabled = true,
            CreatedAt = DateTime.UtcNow
        };

        await repository.AddAsync(provider, CancellationToken.None);

        // Act
        var result = await repository.GetByEntityIdAsync(tenantId2, entityId, CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task UpdateAsync_ExistingProvider_UpdatesSuccessfully()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new SamlProviderRepository(context);
        var tenantId = Guid.NewGuid();
        var providerId = Guid.NewGuid();

        var provider = new SamlProvider
        {
            Id = providerId,
            TenantId = tenantId,
            Name = "Original Name",
            EntityId = "https://idp.example.com/metadata",
            IdpSsoUrl = "https://idp.example.com/sso",
            IdpCertificate = "OriginalCert",
            SpEntityId = "sp",
            SpAssertionConsumerServiceUrl = "https://sp.com/acs",
            BindingType = SamlBindingType.HttpPost,
            SignAuthRequest = false,
            WantAssertionsSigned = false,
            Enabled = true,
            CreatedAt = DateTime.UtcNow.AddDays(-10)
        };

        await repository.AddAsync(provider, CancellationToken.None);

        // Modify the provider
        provider.Update(
            "Updated Name",
            "https://updated.idp.com/sso",
            "UpdatedCert",
            SamlBindingType.HttpRedirect,
            true,
            true,
            false
        );

        // Act
        await repository.UpdateAsync(provider, CancellationToken.None);

        // Retrieve and verify
        var updated = await repository.GetByIdAsync(providerId, CancellationToken.None);

        // Assert
        updated.Should().NotBeNull();
        updated!.Name.Should().Be("Updated Name");
        updated.IdpSsoUrl.Should().Be("https://updated.idp.com/sso");
        updated.IdpCertificate.Should().Be("UpdatedCert");
        updated.BindingType.Should().Be(SamlBindingType.HttpRedirect);
        updated.SignAuthRequest.Should().BeTrue();
        updated.WantAssertionsSigned.Should().BeTrue();
        updated.Enabled.Should().BeFalse();
        updated.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public async Task DeleteAsync_ExistingProvider_DeletesSuccessfully()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new SamlProviderRepository(context);
        var tenantId = Guid.NewGuid();
        var providerId = Guid.NewGuid();

        var provider = new SamlProvider
        {
            Id = providerId,
            TenantId = tenantId,
            Name = "Provider to Delete",
            EntityId = "https://delete.idp.com/metadata",
            IdpSsoUrl = "https://delete.idp.com/sso",
            IdpCertificate = "Cert",
            SpEntityId = "sp",
            SpAssertionConsumerServiceUrl = "https://sp.com/acs",
            BindingType = SamlBindingType.HttpPost,
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
        var repository = new SamlProviderRepository(context);

        // Act & Assert - Should not throw
        await repository.Invoking(r => r.DeleteAsync(Guid.NewGuid(), CancellationToken.None))
            .Should().NotThrowAsync();
    }

    [Fact]
    public async Task GetByTenantIdAsync_ProvidersReturnedInAlphabeticalOrder()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new SamlProviderRepository(context);
        var tenantId = Guid.NewGuid();

        var providerC = new SamlProvider
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "C Provider",
            EntityId = "https://c.idp.com/metadata",
            IdpSsoUrl = "https://c.idp.com/sso",
            IdpCertificate = "CertC",
            SpEntityId = "spC",
            SpAssertionConsumerServiceUrl = "https://spC.com/acs",
            BindingType = SamlBindingType.HttpPost,
            Enabled = true,
            CreatedAt = DateTime.UtcNow
        };

        var providerA = new SamlProvider
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "A Provider",
            EntityId = "https://a.idp.com/metadata",
            IdpSsoUrl = "https://a.idp.com/sso",
            IdpCertificate = "CertA",
            SpEntityId = "spA",
            SpAssertionConsumerServiceUrl = "https://spA.com/acs",
            BindingType = SamlBindingType.HttpRedirect,
            Enabled = true,
            CreatedAt = DateTime.UtcNow
        };

        var providerB = new SamlProvider
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "B Provider",
            EntityId = "https://b.idp.com/metadata",
            IdpSsoUrl = "https://b.idp.com/sso",
            IdpCertificate = "CertB",
            SpEntityId = "spB",
            SpAssertionConsumerServiceUrl = "https://spB.com/acs",
            BindingType = SamlBindingType.HttpPost,
            Enabled = true,
            CreatedAt = DateTime.UtcNow
        };

        // Add in random order
        await repository.AddAsync(providerC, CancellationToken.None);
        await repository.AddAsync(providerA, CancellationToken.None);
        await repository.AddAsync(providerB, CancellationToken.None);

        // Act
        var results = await repository.GetByTenantIdAsync(tenantId, CancellationToken.None);

        // Assert
        results.Should().HaveCount(3);
        results[0].Name.Should().Be("A Provider");
        results[1].Name.Should().Be("B Provider");
        results[2].Name.Should().Be("C Provider");
    }
}
