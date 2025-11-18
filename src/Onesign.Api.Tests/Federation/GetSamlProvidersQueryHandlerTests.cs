using FluentAssertions;
using Moq;
using Onesign.Modules.Federation.Application.DTOs;
using Onesign.Modules.Federation.Application.Queries;
using Onesign.Modules.Federation.Domain.Entities;
using Onesign.Modules.Federation.Domain.Enums;
using Onesign.Modules.Federation.Domain.Repositories;
using Xunit;

namespace Onesign.Api.Tests.Federation;

public class GetSamlProvidersQueryHandlerTests
{
    private readonly Mock<ISamlProviderRepository> _repositoryMock;
    private readonly GetSamlProvidersQueryHandler _handler;

    public GetSamlProvidersQueryHandlerTests()
    {
        _repositoryMock = new Mock<ISamlProviderRepository>();
        _handler = new GetSamlProvidersQueryHandler(_repositoryMock.Object);
    }

    [Fact]
    public async Task Handle_ProvidersExist_ReturnsAllProviders()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetSamlProvidersQuery { TenantId = tenantId };

        var providers = new List<SamlProvider>
        {
            new SamlProvider
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Name = "Provider 1",
                EntityId = "https://idp1.example.com/metadata",
                IdpSsoUrl = "https://idp1.example.com/sso",
                IdpCertificate = "Cert1",
                SpEntityId = "sp1",
                SpAssertionConsumerServiceUrl = "https://sp1.example.com/acs",
                BindingType = SamlBindingType.HttpPost,
                SignAuthRequest = true,
                WantAssertionsSigned = true,
                Enabled = true,
                CreatedAt = DateTime.UtcNow.AddDays(-10)
            },
            new SamlProvider
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Name = "Provider 2",
                EntityId = "https://idp2.example.com/metadata",
                IdpSsoUrl = "https://idp2.example.com/sso",
                IdpCertificate = "Cert2",
                SpEntityId = "sp2",
                SpAssertionConsumerServiceUrl = "https://sp2.example.com/acs",
                BindingType = SamlBindingType.HttpRedirect,
                SignAuthRequest = false,
                WantAssertionsSigned = false,
                Enabled = false,
                CreatedAt = DateTime.UtcNow.AddDays(-5),
                UpdatedAt = DateTime.UtcNow.AddDays(-1)
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
        var query = new GetSamlProvidersQuery { TenantId = tenantId };

        _repositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<SamlProvider>());

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
        var query = new GetSamlProvidersQuery { TenantId = tenantId };

        var providers = new List<SamlProvider>
        {
            new SamlProvider
            {
                Id = providerId,
                TenantId = tenantId,
                Name = "Single Provider",
                EntityId = "https://single.idp.com/metadata",
                IdpSsoUrl = "https://single.idp.com/sso",
                IdpCertificate = "SingleCert",
                SpEntityId = "single-sp",
                SpAssertionConsumerServiceUrl = "https://single.sp.com/acs",
                BindingType = SamlBindingType.HttpPost,
                SignAuthRequest = true,
                WantAssertionsSigned = true,
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
        var query = new GetSamlProvidersQuery { TenantId = tenantId };

        var providers = new List<SamlProvider>
        {
            new SamlProvider
            {
                Id = providerId,
                TenantId = tenantId,
                Name = "Mapping Test Provider",
                EntityId = "https://mapping.idp.com/metadata",
                IdpSsoUrl = "https://mapping.idp.com/sso",
                IdpCertificate = "MappingCert",
                SpEntityId = "mapping-sp",
                SpAssertionConsumerServiceUrl = "https://mapping.sp.com/acs",
                BindingType = SamlBindingType.HttpRedirect,
                SignAuthRequest = false,
                WantAssertionsSigned = true,
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
        dto.EntityId.Should().Be("https://mapping.idp.com/metadata");
        dto.IdpSsoUrl.Should().Be("https://mapping.idp.com/sso");
        dto.IdpCertificate.Should().Be("MappingCert");
        dto.SpEntityId.Should().Be("mapping-sp");
        dto.SpAssertionConsumerServiceUrl.Should().Be("https://mapping.sp.com/acs");
        dto.BindingType.Should().Be(SamlBindingType.HttpRedirect);
        dto.SignAuthRequest.Should().BeFalse();
        dto.WantAssertionsSigned.Should().BeTrue();
        dto.Enabled.Should().BeFalse();
        dto.CreatedAt.Should().Be(createdAt);
        dto.UpdatedAt.Should().Be(updatedAt);
    }

    [Fact]
    public async Task Handle_CancellationRequested_PassesCancellationToken()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetSamlProvidersQuery { TenantId = tenantId };
        var cts = new CancellationTokenSource();
        var token = cts.Token;

        _repositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, token))
            .ReturnsAsync(new List<SamlProvider>());

        // Act
        var result = await _handler.Handle(query, token);

        // Assert
        result.IsSuccess.Should().BeTrue();
        _repositoryMock.Verify(r => r.GetByTenantIdAsync(tenantId, token), Times.Once);
    }

    [Fact]
    public async Task Handle_DifferentTenants_ReturnsOnlyRequestedTenantProviders()
    {
        // Arrange
        var tenantId1 = Guid.NewGuid();
        var tenantId2 = Guid.NewGuid();
        var query = new GetSamlProvidersQuery { TenantId = tenantId1 };

        var tenant1Providers = new List<SamlProvider>
        {
            new SamlProvider
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
                SignAuthRequest = true,
                WantAssertionsSigned = true,
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
    public async Task Handle_MixedBindingTypes_ReturnsBothTypes()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetSamlProvidersQuery { TenantId = tenantId };

        var providers = new List<SamlProvider>
        {
            new SamlProvider
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Name = "HTTP Post Provider",
                EntityId = "https://post.idp.com/metadata",
                IdpSsoUrl = "https://post.idp.com/sso",
                IdpCertificate = "PostCert",
                SpEntityId = "post-sp",
                SpAssertionConsumerServiceUrl = "https://post.sp.com/acs",
                BindingType = SamlBindingType.HttpPost,
                SignAuthRequest = true,
                WantAssertionsSigned = true,
                Enabled = true,
                CreatedAt = DateTime.UtcNow
            },
            new SamlProvider
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Name = "HTTP Redirect Provider",
                EntityId = "https://redirect.idp.com/metadata",
                IdpSsoUrl = "https://redirect.idp.com/sso",
                IdpCertificate = "RedirectCert",
                SpEntityId = "redirect-sp",
                SpAssertionConsumerServiceUrl = "https://redirect.sp.com/acs",
                BindingType = SamlBindingType.HttpRedirect,
                SignAuthRequest = false,
                WantAssertionsSigned = false,
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
        result.Value.Should().HaveCount(2);
        result.Value!.Select(p => p.BindingType)
            .Should().Contain(new[] { SamlBindingType.HttpPost, SamlBindingType.HttpRedirect });
    }

    [Fact]
    public async Task Handle_EnabledAndDisabledProviders_ReturnsBoth()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetSamlProvidersQuery { TenantId = tenantId };

        var providers = new List<SamlProvider>
        {
            new SamlProvider
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Name = "Enabled Provider",
                EntityId = "https://enabled.idp.com/metadata",
                IdpSsoUrl = "https://enabled.idp.com/sso",
                IdpCertificate = "EnabledCert",
                SpEntityId = "enabled-sp",
                SpAssertionConsumerServiceUrl = "https://enabled.sp.com/acs",
                BindingType = SamlBindingType.HttpPost,
                SignAuthRequest = true,
                WantAssertionsSigned = true,
                Enabled = true,
                CreatedAt = DateTime.UtcNow
            },
            new SamlProvider
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Name = "Disabled Provider",
                EntityId = "https://disabled.idp.com/metadata",
                IdpSsoUrl = "https://disabled.idp.com/sso",
                IdpCertificate = "DisabledCert",
                SpEntityId = "disabled-sp",
                SpAssertionConsumerServiceUrl = "https://disabled.sp.com/acs",
                BindingType = SamlBindingType.HttpPost,
                SignAuthRequest = true,
                WantAssertionsSigned = true,
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
        var query = new GetSamlProvidersQuery { TenantId = tenantId };

        var providers = new List<SamlProvider>
        {
            new SamlProvider
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Name = "Never Updated Provider",
                EntityId = "https://never-updated.idp.com/metadata",
                IdpSsoUrl = "https://never-updated.idp.com/sso",
                IdpCertificate = "Cert",
                SpEntityId = "sp",
                SpAssertionConsumerServiceUrl = "https://sp.com/acs",
                BindingType = SamlBindingType.HttpPost,
                SignAuthRequest = true,
                WantAssertionsSigned = true,
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
    public async Task Handle_LargeNumberOfProviders_ReturnsAll()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetSamlProvidersQuery { TenantId = tenantId };

        var providers = Enumerable.Range(1, 100).Select(i => new SamlProvider
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = $"Provider {i}",
            EntityId = $"https://idp{i}.example.com/metadata",
            IdpSsoUrl = $"https://idp{i}.example.com/sso",
            IdpCertificate = $"Cert{i}",
            SpEntityId = $"sp{i}",
            SpAssertionConsumerServiceUrl = $"https://sp{i}.example.com/acs",
            BindingType = i % 2 == 0 ? SamlBindingType.HttpPost : SamlBindingType.HttpRedirect,
            SignAuthRequest = i % 2 == 0,
            WantAssertionsSigned = i % 2 == 0,
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
}
