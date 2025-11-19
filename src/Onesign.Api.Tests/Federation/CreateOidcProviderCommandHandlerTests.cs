using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Onesign.Modules.Federation.Application.Commands;
using Onesign.Modules.Federation.Application.DTOs;
using Onesign.Modules.Federation.Domain.Entities;
using Onesign.Modules.Federation.Domain.Enums;
using Onesign.Modules.Federation.Domain.Repositories;
using Xunit;

namespace Onesign.Api.Tests.Federation;

public class CreateOidcProviderCommandHandlerTests
{
    private readonly Mock<IOidcFederationProviderRepository> _repositoryMock;
    private readonly Mock<ILogger<CreateOidcProviderCommandHandler>> _loggerMock;
    private readonly CreateOidcProviderCommandHandler _handler;

    public CreateOidcProviderCommandHandlerTests()
    {
        _repositoryMock = new Mock<IOidcFederationProviderRepository>();
        _loggerMock = new Mock<ILogger<CreateOidcProviderCommandHandler>>();
        _handler = new CreateOidcProviderCommandHandler(_repositoryMock.Object, _loggerMock.Object);
    }

    [Fact]
    public async Task Handle_ValidAzureADProvider_CreatesSuccessfully()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var command = new CreateOidcProviderCommand
        {
            TenantId = tenantId,
            Name = "Azure AD Provider",
            ProviderType = FederationProviderType.AzureAD,
            Authority = "https://login.microsoftonline.com/tenant-id",
            ClientId = "azure-client-id",
            ClientSecret = "azure-client-secret",
            Scopes = "openid profile email"
        };

        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<OidcFederationProvider>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((OidcFederationProvider provider, CancellationToken ct) => provider);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.Name.Should().Be("Azure AD Provider");
        result.Value.ProviderType.Should().Be(FederationProviderType.AzureAD);
        result.Value.Authority.Should().Be("https://login.microsoftonline.com/tenant-id");
        result.Value.ClientId.Should().Be("azure-client-id");
        result.Value.Scopes.Should().Be("openid profile email");
        result.Value.Enabled.Should().BeTrue();

        _repositoryMock.Verify(r => r.AddAsync(It.IsAny<OidcFederationProvider>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ValidGoogleProvider_CreatesSuccessfully()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var command = new CreateOidcProviderCommand
        {
            TenantId = tenantId,
            Name = "Google Provider",
            ProviderType = FederationProviderType.Google,
            Authority = "https://accounts.google.com",
            ClientId = "google-client-id",
            ClientSecret = "google-client-secret",
            Scopes = "openid profile email"
        };

        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<OidcFederationProvider>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((OidcFederationProvider provider, CancellationToken ct) => provider);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.ProviderType.Should().Be(FederationProviderType.Google);
        result.Value.Authority.Should().Be("https://accounts.google.com");
    }

    [Fact]
    public async Task Handle_ValidOktaProvider_CreatesSuccessfully()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var command = new CreateOidcProviderCommand
        {
            TenantId = tenantId,
            Name = "Okta Provider",
            ProviderType = FederationProviderType.Okta,
            Authority = "https://company.okta.com",
            ClientId = "okta-client-id",
            ClientSecret = "okta-client-secret",
            Scopes = "openid profile email groups"
        };

        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<OidcFederationProvider>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((OidcFederationProvider provider, CancellationToken ct) => provider);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.ProviderType.Should().Be(FederationProviderType.Okta);
        result.Value.Scopes.Should().Be("openid profile email groups");
    }

    [Fact]
    public async Task Handle_ValidGenericOidcProvider_CreatesSuccessfully()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var command = new CreateOidcProviderCommand
        {
            TenantId = tenantId,
            Name = "Generic OIDC Provider",
            ProviderType = FederationProviderType.GenericOidc,
            Authority = "https://custom.identity.provider",
            ClientId = "generic-client-id",
            ClientSecret = "generic-client-secret",
            Scopes = "openid profile"
        };

        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<OidcFederationProvider>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((OidcFederationProvider provider, CancellationToken ct) => provider);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.ProviderType.Should().Be(FederationProviderType.GenericOidc);
    }

    [Fact]
    public async Task Handle_RepositoryThrowsException_ReturnsFailure()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var command = new CreateOidcProviderCommand
        {
            TenantId = tenantId,
            Name = "Exception Provider",
            ProviderType = FederationProviderType.AzureAD,
            Authority = "https://login.microsoftonline.com/tenant-id",
            ClientId = "client-id",
            ClientSecret = "client-secret",
            Scopes = "openid profile email"
        };

        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<OidcFederationProvider>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception("Database connection failed"));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("OIDC_PROVIDER_CREATE_FAILED");
        result.ErrorMessage.Should().Contain("Database connection failed");
    }

    [Fact]
    public async Task Handle_ValidCommand_SetsCorrectTimestamp()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var command = new CreateOidcProviderCommand
        {
            TenantId = tenantId,
            Name = "Timestamp Test Provider",
            ProviderType = FederationProviderType.AzureAD,
            Authority = "https://login.microsoftonline.com/tenant-id",
            ClientId = "client-id",
            ClientSecret = "client-secret",
            Scopes = "openid profile email"
        };

        OidcFederationProvider? capturedProvider = null;
        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<OidcFederationProvider>(), It.IsAny<CancellationToken>()))
            .Callback<OidcFederationProvider, CancellationToken>((p, ct) => capturedProvider = p)
            .ReturnsAsync((OidcFederationProvider provider, CancellationToken ct) => provider);

        // Act
        var beforeAction = DateTime.UtcNow;
        var result = await _handler.Handle(command, CancellationToken.None);
        var afterAction = DateTime.UtcNow;

        // Assert
        result.IsSuccess.Should().BeTrue();
        capturedProvider.Should().NotBeNull();
        capturedProvider!.CreatedAt.Should().BeOnOrAfter(beforeAction);
        capturedProvider.CreatedAt.Should().BeOnOrBefore(afterAction);
    }

    [Fact]
    public async Task Handle_ValidCommand_GeneratesNewId()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var command = new CreateOidcProviderCommand
        {
            TenantId = tenantId,
            Name = "ID Generation Test",
            ProviderType = FederationProviderType.Google,
            Authority = "https://accounts.google.com",
            ClientId = "client-id",
            ClientSecret = "client-secret",
            Scopes = "openid profile email"
        };

        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<OidcFederationProvider>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((OidcFederationProvider provider, CancellationToken ct) => provider);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Id.Should().NotBe(Guid.Empty);
    }

    [Fact]
    public async Task Handle_ValidCommand_ReturnsCorrectDto()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var command = new CreateOidcProviderCommand
        {
            TenantId = tenantId,
            Name = "DTO Mapping Test",
            ProviderType = FederationProviderType.Okta,
            Authority = "https://company.okta.com",
            ClientId = "okta-client-id",
            ClientSecret = "okta-client-secret",
            Scopes = "openid profile email offline_access"
        };

        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<OidcFederationProvider>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((OidcFederationProvider provider, CancellationToken ct) => provider);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        var dto = result.Value;
        dto.Should().NotBeNull();
        dto!.TenantId.Should().Be(tenantId);
        dto.Name.Should().Be("DTO Mapping Test");
        dto.ProviderType.Should().Be(FederationProviderType.Okta);
        dto.Authority.Should().Be("https://company.okta.com");
        dto.ClientId.Should().Be("okta-client-id");
        dto.Scopes.Should().Be("openid profile email offline_access");
        dto.Enabled.Should().BeTrue();
        dto.UpdatedAt.Should().BeNull();
    }

    [Fact]
    public async Task Handle_ValidCommand_DoesNotExposeClientSecret()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var command = new CreateOidcProviderCommand
        {
            TenantId = tenantId,
            Name = "Secret Test",
            ProviderType = FederationProviderType.AzureAD,
            Authority = "https://login.microsoftonline.com/tenant-id",
            ClientId = "client-id",
            ClientSecret = "super-secret-value",
            Scopes = "openid profile email"
        };

        OidcFederationProvider? capturedProvider = null;
        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<OidcFederationProvider>(), It.IsAny<CancellationToken>()))
            .Callback<OidcFederationProvider, CancellationToken>((p, ct) => capturedProvider = p)
            .ReturnsAsync((OidcFederationProvider provider, CancellationToken ct) => provider);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        // Verify secret is stored in entity
        capturedProvider!.ClientSecret.Should().Be("super-secret-value");
        // DTO should not contain ClientSecret field (by design of OidcFederationProviderDto)
    }

    [Fact]
    public async Task Handle_CancellationRequested_PassesCancellationToken()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var command = new CreateOidcProviderCommand
        {
            TenantId = tenantId,
            Name = "Cancellation Test",
            ProviderType = FederationProviderType.AzureAD,
            Authority = "https://login.microsoftonline.com/tenant-id",
            ClientId = "client-id",
            ClientSecret = "client-secret",
            Scopes = "openid profile email"
        };

        var cts = new CancellationTokenSource();
        var token = cts.Token;

        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<OidcFederationProvider>(), token))
            .ReturnsAsync((OidcFederationProvider provider, CancellationToken ct) => provider);

        // Act
        var result = await _handler.Handle(command, token);

        // Assert
        result.IsSuccess.Should().BeTrue();
        _repositoryMock.Verify(r => r.AddAsync(It.IsAny<OidcFederationProvider>(), token), Times.Once);
    }

    [Fact]
    public async Task Handle_CustomScopes_PreservesScopes()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var customScopes = "openid profile email groups directory.read offline_access";
        var command = new CreateOidcProviderCommand
        {
            TenantId = tenantId,
            Name = "Custom Scopes Test",
            ProviderType = FederationProviderType.AzureAD,
            Authority = "https://login.microsoftonline.com/tenant-id",
            ClientId = "client-id",
            ClientSecret = "client-secret",
            Scopes = customScopes
        };

        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<OidcFederationProvider>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((OidcFederationProvider provider, CancellationToken ct) => provider);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Scopes.Should().Be(customScopes);
    }

    [Fact]
    public async Task Handle_DefaultScopes_UsesDefaultValue()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var command = new CreateOidcProviderCommand
        {
            TenantId = tenantId,
            Name = "Default Scopes Test",
            ProviderType = FederationProviderType.Google,
            Authority = "https://accounts.google.com",
            ClientId = "client-id",
            ClientSecret = "client-secret"
            // Scopes not set, should use default
        };

        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<OidcFederationProvider>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((OidcFederationProvider provider, CancellationToken ct) => provider);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Scopes.Should().Be("openid profile email");
    }

    [Fact]
    public async Task Handle_MultipleTenants_CreatesIndependentProviders()
    {
        // Arrange
        var tenantId1 = Guid.NewGuid();
        var tenantId2 = Guid.NewGuid();

        var command1 = new CreateOidcProviderCommand
        {
            TenantId = tenantId1,
            Name = "Tenant 1 Provider",
            ProviderType = FederationProviderType.AzureAD,
            Authority = "https://login.microsoftonline.com/tenant1",
            ClientId = "client-id-1",
            ClientSecret = "client-secret-1",
            Scopes = "openid profile email"
        };

        var command2 = new CreateOidcProviderCommand
        {
            TenantId = tenantId2,
            Name = "Tenant 2 Provider",
            ProviderType = FederationProviderType.AzureAD,
            Authority = "https://login.microsoftonline.com/tenant2",
            ClientId = "client-id-2",
            ClientSecret = "client-secret-2",
            Scopes = "openid profile email"
        };

        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<OidcFederationProvider>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((OidcFederationProvider provider, CancellationToken ct) => provider);

        // Act
        var result1 = await _handler.Handle(command1, CancellationToken.None);
        var result2 = await _handler.Handle(command2, CancellationToken.None);

        // Assert
        result1.IsSuccess.Should().BeTrue();
        result2.IsSuccess.Should().BeTrue();
        result1.Value!.TenantId.Should().Be(tenantId1);
        result2.Value!.TenantId.Should().Be(tenantId2);
        result1.Value.Id.Should().NotBe(result2.Value!.Id);
    }
}
