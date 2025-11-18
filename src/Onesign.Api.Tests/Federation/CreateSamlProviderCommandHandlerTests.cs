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

public class CreateSamlProviderCommandHandlerTests
{
    private readonly Mock<ISamlProviderRepository> _repositoryMock;
    private readonly Mock<ILogger<CreateSamlProviderCommandHandler>> _loggerMock;
    private readonly CreateSamlProviderCommandHandler _handler;

    public CreateSamlProviderCommandHandlerTests()
    {
        _repositoryMock = new Mock<ISamlProviderRepository>();
        _loggerMock = new Mock<ILogger<CreateSamlProviderCommandHandler>>();
        _handler = new CreateSamlProviderCommandHandler(_repositoryMock.Object, _loggerMock.Object);
    }

    [Fact]
    public async Task Handle_ValidCommand_CreatesSamlProviderSuccessfully()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var command = new CreateSamlProviderCommand
        {
            TenantId = tenantId,
            Name = "Test SAML Provider",
            EntityId = "https://idp.example.com/metadata",
            IdpSsoUrl = "https://idp.example.com/sso",
            IdpCertificate = "MIICertificateContent",
            BindingType = SamlBindingType.HttpPost,
            SignAuthRequest = true,
            WantAssertionsSigned = true
        };

        _repositoryMock
            .Setup(r => r.GetByEntityIdAsync(tenantId, command.EntityId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((SamlProvider?)null);

        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<SamlProvider>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((SamlProvider provider, CancellationToken ct) => provider);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.Name.Should().Be("Test SAML Provider");
        result.Value.EntityId.Should().Be("https://idp.example.com/metadata");
        result.Value.IdpSsoUrl.Should().Be("https://idp.example.com/sso");
        result.Value.IdpCertificate.Should().Be("MIICertificateContent");
        result.Value.BindingType.Should().Be(SamlBindingType.HttpPost);
        result.Value.SignAuthRequest.Should().BeTrue();
        result.Value.WantAssertionsSigned.Should().BeTrue();
        result.Value.Enabled.Should().BeTrue();
        result.Value.SpEntityId.Should().Be($"onesign:{tenantId}:saml");
        result.Value.SpAssertionConsumerServiceUrl.Should().Be($"https://login.onesign.com/saml/acs/{tenantId}");

        _repositoryMock.Verify(r => r.AddAsync(It.IsAny<SamlProvider>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_HttpRedirectBinding_CreatesSamlProviderSuccessfully()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var command = new CreateSamlProviderCommand
        {
            TenantId = tenantId,
            Name = "HTTP Redirect SAML Provider",
            EntityId = "https://idp.redirect.com/metadata",
            IdpSsoUrl = "https://idp.redirect.com/sso",
            IdpCertificate = "CertificateContent",
            BindingType = SamlBindingType.HttpRedirect,
            SignAuthRequest = false,
            WantAssertionsSigned = false
        };

        _repositoryMock
            .Setup(r => r.GetByEntityIdAsync(tenantId, command.EntityId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((SamlProvider?)null);

        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<SamlProvider>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((SamlProvider provider, CancellationToken ct) => provider);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.BindingType.Should().Be(SamlBindingType.HttpRedirect);
        result.Value.SignAuthRequest.Should().BeFalse();
        result.Value.WantAssertionsSigned.Should().BeFalse();
    }

    [Fact]
    public async Task Handle_DuplicateEntityId_ReturnsFailure()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var command = new CreateSamlProviderCommand
        {
            TenantId = tenantId,
            Name = "Duplicate SAML Provider",
            EntityId = "https://existing.idp.com/metadata",
            IdpSsoUrl = "https://existing.idp.com/sso",
            IdpCertificate = "CertificateContent",
            BindingType = SamlBindingType.HttpPost,
            SignAuthRequest = true,
            WantAssertionsSigned = true
        };

        var existingProvider = new SamlProvider
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Existing Provider",
            EntityId = command.EntityId
        };

        _repositoryMock
            .Setup(r => r.GetByEntityIdAsync(tenantId, command.EntityId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingProvider);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("SAML_ENTITY_ID_EXISTS");
        result.ErrorMessage.Should().Contain("already exists");

        _repositoryMock.Verify(r => r.AddAsync(It.IsAny<SamlProvider>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_RepositoryThrowsException_ReturnsFailure()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var command = new CreateSamlProviderCommand
        {
            TenantId = tenantId,
            Name = "Exception SAML Provider",
            EntityId = "https://exception.idp.com/metadata",
            IdpSsoUrl = "https://exception.idp.com/sso",
            IdpCertificate = "CertificateContent",
            BindingType = SamlBindingType.HttpPost,
            SignAuthRequest = true,
            WantAssertionsSigned = true
        };

        _repositoryMock
            .Setup(r => r.GetByEntityIdAsync(tenantId, command.EntityId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((SamlProvider?)null);

        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<SamlProvider>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception("Database connection failed"));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("SAML_PROVIDER_CREATE_FAILED");
        result.ErrorMessage.Should().Contain("Database connection failed");
    }

    [Fact]
    public async Task Handle_ValidCommand_SetsCorrectTimestamp()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var command = new CreateSamlProviderCommand
        {
            TenantId = tenantId,
            Name = "Timestamp Test Provider",
            EntityId = "https://timestamp.idp.com/metadata",
            IdpSsoUrl = "https://timestamp.idp.com/sso",
            IdpCertificate = "CertificateContent",
            BindingType = SamlBindingType.HttpPost,
            SignAuthRequest = true,
            WantAssertionsSigned = true
        };

        SamlProvider? capturedProvider = null;
        _repositoryMock
            .Setup(r => r.GetByEntityIdAsync(tenantId, command.EntityId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((SamlProvider?)null);

        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<SamlProvider>(), It.IsAny<CancellationToken>()))
            .Callback<SamlProvider, CancellationToken>((p, ct) => capturedProvider = p)
            .ReturnsAsync((SamlProvider provider, CancellationToken ct) => provider);

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
        var command = new CreateSamlProviderCommand
        {
            TenantId = tenantId,
            Name = "ID Generation Test",
            EntityId = "https://idgen.idp.com/metadata",
            IdpSsoUrl = "https://idgen.idp.com/sso",
            IdpCertificate = "CertificateContent",
            BindingType = SamlBindingType.HttpPost,
            SignAuthRequest = true,
            WantAssertionsSigned = true
        };

        _repositoryMock
            .Setup(r => r.GetByEntityIdAsync(tenantId, command.EntityId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((SamlProvider?)null);

        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<SamlProvider>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((SamlProvider provider, CancellationToken ct) => provider);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Id.Should().NotBe(Guid.Empty);
    }

    [Fact]
    public async Task Handle_DifferentTenants_AllowsSameEntityId()
    {
        // Arrange
        var tenantId1 = Guid.NewGuid();
        var tenantId2 = Guid.NewGuid();
        var sharedEntityId = "https://shared.idp.com/metadata";

        var command = new CreateSamlProviderCommand
        {
            TenantId = tenantId2,
            Name = "Shared Entity Provider",
            EntityId = sharedEntityId,
            IdpSsoUrl = "https://shared.idp.com/sso",
            IdpCertificate = "CertificateContent",
            BindingType = SamlBindingType.HttpPost,
            SignAuthRequest = true,
            WantAssertionsSigned = true
        };

        // Entity exists for tenant1 but not for tenant2
        _repositoryMock
            .Setup(r => r.GetByEntityIdAsync(tenantId2, sharedEntityId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((SamlProvider?)null);

        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<SamlProvider>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((SamlProvider provider, CancellationToken ct) => provider);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.TenantId.Should().Be(tenantId2);
    }

    [Fact]
    public async Task Handle_ValidCommand_ReturnsCorrectDto()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var command = new CreateSamlProviderCommand
        {
            TenantId = tenantId,
            Name = "DTO Mapping Test",
            EntityId = "https://dto.idp.com/metadata",
            IdpSsoUrl = "https://dto.idp.com/sso",
            IdpCertificate = "MappingCertificate",
            BindingType = SamlBindingType.HttpRedirect,
            SignAuthRequest = false,
            WantAssertionsSigned = true
        };

        _repositoryMock
            .Setup(r => r.GetByEntityIdAsync(tenantId, command.EntityId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((SamlProvider?)null);

        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<SamlProvider>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((SamlProvider provider, CancellationToken ct) => provider);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        var dto = result.Value;
        dto.Should().NotBeNull();
        dto!.TenantId.Should().Be(tenantId);
        dto.Name.Should().Be("DTO Mapping Test");
        dto.EntityId.Should().Be("https://dto.idp.com/metadata");
        dto.IdpSsoUrl.Should().Be("https://dto.idp.com/sso");
        dto.IdpCertificate.Should().Be("MappingCertificate");
        dto.BindingType.Should().Be(SamlBindingType.HttpRedirect);
        dto.SignAuthRequest.Should().BeFalse();
        dto.WantAssertionsSigned.Should().BeTrue();
        dto.Enabled.Should().BeTrue();
        dto.UpdatedAt.Should().BeNull();
    }

    [Fact]
    public async Task Handle_CancellationRequested_PassesCancellationToken()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var command = new CreateSamlProviderCommand
        {
            TenantId = tenantId,
            Name = "Cancellation Test",
            EntityId = "https://cancel.idp.com/metadata",
            IdpSsoUrl = "https://cancel.idp.com/sso",
            IdpCertificate = "CertificateContent",
            BindingType = SamlBindingType.HttpPost,
            SignAuthRequest = true,
            WantAssertionsSigned = true
        };

        var cts = new CancellationTokenSource();
        var token = cts.Token;

        _repositoryMock
            .Setup(r => r.GetByEntityIdAsync(tenantId, command.EntityId, token))
            .ReturnsAsync((SamlProvider?)null);

        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<SamlProvider>(), token))
            .ReturnsAsync((SamlProvider provider, CancellationToken ct) => provider);

        // Act
        var result = await _handler.Handle(command, token);

        // Assert
        result.IsSuccess.Should().BeTrue();
        _repositoryMock.Verify(r => r.GetByEntityIdAsync(tenantId, command.EntityId, token), Times.Once);
        _repositoryMock.Verify(r => r.AddAsync(It.IsAny<SamlProvider>(), token), Times.Once);
    }
}
