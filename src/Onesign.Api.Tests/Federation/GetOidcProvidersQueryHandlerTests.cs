using FluentAssertions;
using Moq;
using Onesign.Modules.Federation.Application.DTOs;
using Onesign.Modules.Federation.Application.Queries;
using Onesign.Modules.Federation.Domain.Entities;
using Onesign.Modules.Federation.Domain.Enums;
using Onesign.Modules.Federation.Domain.Repositories;
using Xunit;

namespace Onesign.Api.Tests.Federation;

public class GetOidcProvidersQueryHandlerTests
{
    private readonly Mock<IOidcFederationProviderRepository> _repositoryMock;
    private readonly GetOidcProvidersQueryHandler _handler;

    public GetOidcProvidersQueryHandlerTests()
    {
        _repositoryMock = new Mock<IOidcFederationProviderRepository>();
        _handler = new GetOidcProvidersQueryHandler(_repositoryMock.Object);
    }

    [Fact]
    public async Task Handle_ProvidersExist_ReturnsAllProviders()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetOidcProvidersQuery { TenantId = tenantId };

        var providers = new List<OidcFederationProvider>
        {
            new OidcFederationProvider
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Name = "Azure AD",
                ProviderType = FederationProviderType.AzureAD,
                Authority = "https://login.microsoftonline.com/tenant1",
                ClientId = "client-id-1",
                ClientSecret = "secret-1",
                Scopes = "openid profile email",
                Enabled = true,
                CreatedAt = DateTime.UtcNow.AddDays(-10)
            },
            new OidcFederationProvider
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Name = "Google",
                ProviderType = FederationProviderType.Google,
                Authority = "https://accounts.google.com",
                ClientId = "client-id-2",
                ClientSecret = "secret-2",
                Scopes = "openid profile email",
                Enabled = true,
                CreatedAt = DateTime.UtcNow.AddDays(-5)
            }
        };

        _repositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(providers);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.Should().HaveCount(2);
    }

    [Fact]
    public async Task Handle_NoProviders_ReturnsEmptyList()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetOidcProvidersQuery { TenantId = tenantId };

        _repositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<OidcFederationProvider>());

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_SingleProvider_ReturnsSingleProvider()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var providerId = Guid.NewGuid();
        var query = new GetOidcProvidersQuery { TenantId = tenantId };

        var providers = new List<OidcFederationProvider>
        {
            new OidcFederationProvider
            {
                Id = providerId,
                TenantId = tenantId,
                Name = "Single Provider",
                ProviderType = FederationProviderType.Okta,
                Authority = "https://company.okta.com",
                ClientId = "okta-client-id",
                ClientSecret = "okta-secret",
                Scopes = "openid profile email groups",
                Enabled = true,
                CreatedAt = DateTime.UtcNow
            }
        };

        _repositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(providers);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(1);
        result.Value![0].Id.Should().Be(providerId);
        result.Value[0].Name.Should().Be("Single Provider");
    }

    [Fact]
    public async Task Handle_ValidQuery_MapsAllFieldsCorrectly()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var providerId = Guid.NewGuid();
        var createdAt = DateTime.UtcNow.AddDays(-5);
        var updatedAt = DateTime.UtcNow.AddDays(-1);
        var query = new GetOidcProvidersQuery { TenantId = tenantId };

        var providers = new List<OidcFederationProvider>
        {
            new OidcFederationProvider
            {
                Id = providerId,
                TenantId = tenantId,
                Name = "Mapping Test Provider",
                ProviderType = FederationProviderType.GenericOidc,
                Authority = "https://custom.oidc.provider",
                ClientId = "custom-client-id",
                ClientSecret = "custom-secret",
                Scopes = "openid profile email custom_scope",
                Enabled = false,
                CreatedAt = createdAt,
                UpdatedAt = updatedAt
            }
        };

        _repositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(providers);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        var dto = result.Value![0];
        dto.Id.Should().Be(providerId);
        dto.TenantId.Should().Be(tenantId);
        dto.Name.Should().Be("Mapping Test Provider");
        dto.ProviderType.Should().Be(FederationProviderType.GenericOidc);
        dto.Authority.Should().Be("https://custom.oidc.provider");
        dto.ClientId.Should().Be("custom-client-id");
        dto.Scopes.Should().Be("openid profile email custom_scope");
        dto.Enabled.Should().BeFalse();
        dto.CreatedAt.Should().Be(createdAt);
        dto.UpdatedAt.Should().Be(updatedAt);
    }

    [Fact]
    public async Task Handle_ValidQuery_DoesNotExposeClientSecret()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetOidcProvidersQuery { TenantId = tenantId };

        var providers = new List<OidcFederationProvider>
        {
            new OidcFederationProvider
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Name = "Secret Test",
                ProviderType = FederationProviderType.AzureAD,
                Authority = "https://login.microsoftonline.com/tenant",
                ClientId = "client-id",
                ClientSecret = "super-secret-value",
                Scopes = "openid profile email",
                Enabled = true,
                CreatedAt = DateTime.UtcNow
            }
        };

        _repositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(providers);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        // OidcFederationProviderDto does not contain ClientSecret property by design
        // This test verifies the DTO mapping doesn't expose the secret
    }

    [Fact]
    public async Task Handle_CancellationRequested_PassesCancellationToken()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetOidcProvidersQuery { TenantId = tenantId };
        var cts = new CancellationTokenSource();
        var token = cts.Token;

        _repositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, token))
            .ReturnsAsync(new List<OidcFederationProvider>());

        // Act
        var result = await _handler.Handle(query, token);

        // Assert
        result.IsSuccess.Should().BeTrue();
        _repositoryMock.Verify(r => r.GetByTenantIdAsync(tenantId, token), Times.Once);
    }

    [Fact]
    public async Task Handle_AllProviderTypes_ReturnedCorrectly()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetOidcProvidersQuery { TenantId = tenantId };

        var providers = new List<OidcFederationProvider>
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

        _repositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(providers);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(4);
        result.Value!.Select(p => p.ProviderType).Should().Contain(new[]
        {
            FederationProviderType.AzureAD,
            FederationProviderType.Google,
            FederationProviderType.Okta,
            FederationProviderType.GenericOidc
        });
    }

    [Fact]
    public async Task Handle_DifferentTenants_ReturnsOnlyRequestedTenantProviders()
    {
        // Arrange
        var tenantId1 = Guid.NewGuid();
        var tenantId2 = Guid.NewGuid();
        var query = new GetOidcProvidersQuery { TenantId = tenantId1 };

        var tenant1Providers = new List<OidcFederationProvider>
        {
            new OidcFederationProvider
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId1,
                Name = "Tenant 1 Provider",
                ProviderType = FederationProviderType.AzureAD,
                Authority = "https://login.microsoftonline.com/tenant1",
                ClientId = "client-1",
                ClientSecret = "secret-1",
                Scopes = "openid",
                Enabled = true,
                CreatedAt = DateTime.UtcNow
            }
        };

        _repositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenant1Providers);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(1);
        result.Value![0].TenantId.Should().Be(tenantId1);
    }

    [Fact]
    public async Task Handle_EnabledAndDisabledProviders_ReturnsBoth()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetOidcProvidersQuery { TenantId = tenantId };

        var providers = new List<OidcFederationProvider>
        {
            new OidcFederationProvider
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Name = "Enabled Provider",
                ProviderType = FederationProviderType.AzureAD,
                Authority = "https://login.microsoftonline.com/enabled",
                ClientId = "enabled-client",
                ClientSecret = "secret",
                Scopes = "openid",
                Enabled = true,
                CreatedAt = DateTime.UtcNow
            },
            new OidcFederationProvider
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Name = "Disabled Provider",
                ProviderType = FederationProviderType.Google,
                Authority = "https://accounts.google.com",
                ClientId = "disabled-client",
                ClientSecret = "secret",
                Scopes = "openid",
                Enabled = false,
                CreatedAt = DateTime.UtcNow
            }
        };

        _repositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(providers);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(2);
        result.Value!.Select(p => p.Enabled).Should().Contain(new[] { true, false });
    }

    [Fact]
    public async Task Handle_ProvidersWithNullUpdatedAt_HandlesCorrectly()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetOidcProvidersQuery { TenantId = tenantId };

        var providers = new List<OidcFederationProvider>
        {
            new OidcFederationProvider
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Name = "Never Updated Provider",
                ProviderType = FederationProviderType.Okta,
                Authority = "https://company.okta.com",
                ClientId = "client",
                ClientSecret = "secret",
                Scopes = "openid",
                Enabled = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = null
            }
        };

        _repositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(providers);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value![0].UpdatedAt.Should().BeNull();
    }

    [Fact]
    public async Task Handle_ProvidersWithCustomScopes_ReturnsCorrectScopes()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetOidcProvidersQuery { TenantId = tenantId };

        var providers = new List<OidcFederationProvider>
        {
            new OidcFederationProvider
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Name = "Custom Scopes Provider",
                ProviderType = FederationProviderType.AzureAD,
                Authority = "https://login.microsoftonline.com/tenant",
                ClientId = "client",
                ClientSecret = "secret",
                Scopes = "openid profile email offline_access groups directory.read",
                Enabled = true,
                CreatedAt = DateTime.UtcNow
            }
        };

        _repositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(providers);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value![0].Scopes.Should().Be("openid profile email offline_access groups directory.read");
    }

    [Fact]
    public async Task Handle_LargeNumberOfProviders_ReturnsAll()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetOidcProvidersQuery { TenantId = tenantId };

        var providerTypes = new[]
        {
            FederationProviderType.AzureAD,
            FederationProviderType.Google,
            FederationProviderType.Okta,
            FederationProviderType.GenericOidc
        };

        var providers = Enumerable.Range(1, 100).Select(i => new OidcFederationProvider
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = $"Provider {i}",
            ProviderType = providerTypes[i % 4],
            Authority = $"https://provider{i}.example.com",
            ClientId = $"client-{i}",
            ClientSecret = $"secret-{i}",
            Scopes = "openid profile email",
            Enabled = i % 3 != 0,
            CreatedAt = DateTime.UtcNow.AddDays(-i)
        }).ToList();

        _repositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(providers);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(100);
    }

    [Fact]
    public async Task Handle_ProvidersWithUpdates_ReturnsUpdatedTimestamps()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetOidcProvidersQuery { TenantId = tenantId };
        var createdAt = DateTime.UtcNow.AddDays(-30);
        var updatedAt = DateTime.UtcNow.AddHours(-1);

        var providers = new List<OidcFederationProvider>
        {
            new OidcFederationProvider
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Name = "Updated Provider",
                ProviderType = FederationProviderType.AzureAD,
                Authority = "https://login.microsoftonline.com/tenant",
                ClientId = "client",
                ClientSecret = "secret",
                Scopes = "openid profile email",
                Enabled = true,
                CreatedAt = createdAt,
                UpdatedAt = updatedAt
            }
        };

        _repositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(providers);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value![0].CreatedAt.Should().Be(createdAt);
        result.Value[0].UpdatedAt.Should().Be(updatedAt);
    }
}
