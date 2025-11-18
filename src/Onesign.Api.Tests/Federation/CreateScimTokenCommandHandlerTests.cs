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

public class CreateScimTokenCommandHandlerTests
{
    private readonly Mock<IScimTokenRepository> _repositoryMock;
    private readonly Mock<ILogger<CreateScimTokenCommandHandler>> _loggerMock;
    private readonly CreateScimTokenCommandHandler _handler;

    public CreateScimTokenCommandHandlerTests()
    {
        _repositoryMock = new Mock<IScimTokenRepository>();
        _loggerMock = new Mock<ILogger<CreateScimTokenCommandHandler>>();
        _handler = new CreateScimTokenCommandHandler(_repositoryMock.Object, _loggerMock.Object);
    }

    [Fact]
    public async Task Handle_ValidCommand_CreatesScimTokenSuccessfully()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var command = new CreateScimTokenCommand
        {
            TenantId = tenantId,
            Name = "Production SCIM Token",
            ExpiresAt = DateTime.UtcNow.AddYears(1)
        };

        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<ScimToken>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((ScimToken token, CancellationToken ct) => token);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.Name.Should().Be("Production SCIM Token");
        result.Value.TenantId.Should().Be(tenantId);
        result.Value.Status.Should().Be(ScimTokenStatus.Active);
        result.Value.ExpiresAt.Should().NotBeNull();
        result.Value.PlainToken.Should().NotBeNullOrEmpty();

        _repositoryMock.Verify(r => r.AddAsync(It.IsAny<ScimToken>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_NoExpiration_CreatesTokenWithoutExpiration()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var command = new CreateScimTokenCommand
        {
            TenantId = tenantId,
            Name = "Non-expiring Token",
            ExpiresAt = null
        };

        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<ScimToken>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((ScimToken token, CancellationToken ct) => token);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.ExpiresAt.Should().BeNull();
    }

    [Fact]
    public async Task Handle_ValidCommand_GeneratesSecureToken()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var command = new CreateScimTokenCommand
        {
            TenantId = tenantId,
            Name = "Secure Token Test",
            ExpiresAt = DateTime.UtcNow.AddMonths(6)
        };

        ScimToken? capturedToken = null;
        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<ScimToken>(), It.IsAny<CancellationToken>()))
            .Callback<ScimToken, CancellationToken>((t, ct) => capturedToken = t)
            .ReturnsAsync((ScimToken token, CancellationToken ct) => token);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();

        // Plain token should be returned to user
        result.Value!.PlainToken.Should().NotBeNullOrEmpty();
        result.Value.PlainToken!.Length.Should().BeGreaterThan(20);

        // Token hash should be stored
        capturedToken.Should().NotBeNull();
        capturedToken!.TokenHash.Should().NotBeNullOrEmpty();

        // Plain token and hash should be different
        result.Value.PlainToken.Should().NotBe(capturedToken.TokenHash);
    }

    [Fact]
    public async Task Handle_MultipleTokens_GeneratesUniqueTokens()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var command1 = new CreateScimTokenCommand
        {
            TenantId = tenantId,
            Name = "Token 1",
            ExpiresAt = DateTime.UtcNow.AddMonths(6)
        };

        var command2 = new CreateScimTokenCommand
        {
            TenantId = tenantId,
            Name = "Token 2",
            ExpiresAt = DateTime.UtcNow.AddMonths(6)
        };

        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<ScimToken>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((ScimToken token, CancellationToken ct) => token);

        // Act
        var result1 = await _handler.Handle(command1, CancellationToken.None);
        var result2 = await _handler.Handle(command2, CancellationToken.None);

        // Assert
        result1.IsSuccess.Should().BeTrue();
        result2.IsSuccess.Should().BeTrue();
        result1.Value!.PlainToken.Should().NotBe(result2.Value!.PlainToken);
        result1.Value.Id.Should().NotBe(result2.Value.Id);
    }

    [Fact]
    public async Task Handle_RepositoryThrowsException_ReturnsFailure()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var command = new CreateScimTokenCommand
        {
            TenantId = tenantId,
            Name = "Exception Token",
            ExpiresAt = DateTime.UtcNow.AddMonths(6)
        };

        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<ScimToken>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception("Database connection failed"));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("SCIM_TOKEN_CREATE_FAILED");
        result.ErrorMessage.Should().Contain("Database connection failed");
    }

    [Fact]
    public async Task Handle_ValidCommand_SetsCorrectTimestamp()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var command = new CreateScimTokenCommand
        {
            TenantId = tenantId,
            Name = "Timestamp Test Token",
            ExpiresAt = DateTime.UtcNow.AddMonths(6)
        };

        ScimToken? capturedToken = null;
        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<ScimToken>(), It.IsAny<CancellationToken>()))
            .Callback<ScimToken, CancellationToken>((t, ct) => capturedToken = t)
            .ReturnsAsync((ScimToken token, CancellationToken ct) => token);

        // Act
        var beforeAction = DateTime.UtcNow;
        var result = await _handler.Handle(command, CancellationToken.None);
        var afterAction = DateTime.UtcNow;

        // Assert
        result.IsSuccess.Should().BeTrue();
        capturedToken.Should().NotBeNull();
        capturedToken!.CreatedAt.Should().BeOnOrAfter(beforeAction);
        capturedToken.CreatedAt.Should().BeOnOrBefore(afterAction);
    }

    [Fact]
    public async Task Handle_ValidCommand_GeneratesNewId()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var command = new CreateScimTokenCommand
        {
            TenantId = tenantId,
            Name = "ID Generation Test",
            ExpiresAt = DateTime.UtcNow.AddMonths(6)
        };

        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<ScimToken>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((ScimToken token, CancellationToken ct) => token);

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
        var expiresAt = DateTime.UtcNow.AddYears(1);
        var command = new CreateScimTokenCommand
        {
            TenantId = tenantId,
            Name = "DTO Mapping Test",
            ExpiresAt = expiresAt
        };

        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<ScimToken>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((ScimToken token, CancellationToken ct) => token);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        var dto = result.Value;
        dto.Should().NotBeNull();
        dto!.TenantId.Should().Be(tenantId);
        dto.Name.Should().Be("DTO Mapping Test");
        dto.Status.Should().Be(ScimTokenStatus.Active);
        dto.ExpiresAt.Should().Be(expiresAt);
        dto.LastUsedAt.Should().BeNull();
        dto.PlainToken.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task Handle_CancellationRequested_PassesCancellationToken()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var command = new CreateScimTokenCommand
        {
            TenantId = tenantId,
            Name = "Cancellation Test",
            ExpiresAt = DateTime.UtcNow.AddMonths(6)
        };

        var cts = new CancellationTokenSource();
        var token = cts.Token;

        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<ScimToken>(), token))
            .ReturnsAsync((ScimToken scimToken, CancellationToken ct) => scimToken);

        // Act
        var result = await _handler.Handle(command, token);

        // Assert
        result.IsSuccess.Should().BeTrue();
        _repositoryMock.Verify(r => r.AddAsync(It.IsAny<ScimToken>(), token), Times.Once);
    }

    [Fact]
    public async Task Handle_ValidCommand_TokenIsUrlSafe()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var command = new CreateScimTokenCommand
        {
            TenantId = tenantId,
            Name = "URL Safe Token Test",
            ExpiresAt = DateTime.UtcNow.AddMonths(6)
        };

        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<ScimToken>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((ScimToken token, CancellationToken ct) => token);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        var plainToken = result.Value!.PlainToken!;

        // URL-safe base64 should not contain +, /, or =
        plainToken.Should().NotContain("+");
        plainToken.Should().NotContain("/");
        plainToken.Should().NotContain("=");
    }

    [Fact]
    public async Task Handle_ValidCommand_TokenHashIsDeterministic()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var command = new CreateScimTokenCommand
        {
            TenantId = tenantId,
            Name = "Hash Test",
            ExpiresAt = DateTime.UtcNow.AddMonths(6)
        };

        var capturedTokens = new List<ScimToken>();
        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<ScimToken>(), It.IsAny<CancellationToken>()))
            .Callback<ScimToken, CancellationToken>((t, ct) => capturedTokens.Add(t))
            .ReturnsAsync((ScimToken token, CancellationToken ct) => token);

        // Act - create multiple tokens
        var result1 = await _handler.Handle(command, CancellationToken.None);
        var result2 = await _handler.Handle(command, CancellationToken.None);

        // Assert - different tokens should have different hashes
        result1.IsSuccess.Should().BeTrue();
        result2.IsSuccess.Should().BeTrue();
        capturedTokens.Should().HaveCount(2);
        capturedTokens[0].TokenHash.Should().NotBe(capturedTokens[1].TokenHash);
    }

    [Fact]
    public async Task Handle_ShortExpirationPeriod_HandlesCorrectly()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var shortExpiration = DateTime.UtcNow.AddHours(1);
        var command = new CreateScimTokenCommand
        {
            TenantId = tenantId,
            Name = "Short-lived Token",
            ExpiresAt = shortExpiration
        };

        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<ScimToken>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((ScimToken token, CancellationToken ct) => token);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.ExpiresAt.Should().Be(shortExpiration);
    }

    [Fact]
    public async Task Handle_LongExpirationPeriod_HandlesCorrectly()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var longExpiration = DateTime.UtcNow.AddYears(10);
        var command = new CreateScimTokenCommand
        {
            TenantId = tenantId,
            Name = "Long-lived Token",
            ExpiresAt = longExpiration
        };

        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<ScimToken>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((ScimToken token, CancellationToken ct) => token);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.ExpiresAt.Should().Be(longExpiration);
    }

    [Fact]
    public async Task Handle_MultipleTenants_CreatesIndependentTokens()
    {
        // Arrange
        var tenantId1 = Guid.NewGuid();
        var tenantId2 = Guid.NewGuid();

        var command1 = new CreateScimTokenCommand
        {
            TenantId = tenantId1,
            Name = "Tenant 1 Token",
            ExpiresAt = DateTime.UtcNow.AddMonths(6)
        };

        var command2 = new CreateScimTokenCommand
        {
            TenantId = tenantId2,
            Name = "Tenant 2 Token",
            ExpiresAt = DateTime.UtcNow.AddMonths(6)
        };

        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<ScimToken>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((ScimToken token, CancellationToken ct) => token);

        // Act
        var result1 = await _handler.Handle(command1, CancellationToken.None);
        var result2 = await _handler.Handle(command2, CancellationToken.None);

        // Assert
        result1.IsSuccess.Should().BeTrue();
        result2.IsSuccess.Should().BeTrue();
        result1.Value!.TenantId.Should().Be(tenantId1);
        result2.Value!.TenantId.Should().Be(tenantId2);
    }

    [Fact]
    public async Task Handle_ValidCommand_StatusIsActive()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var command = new CreateScimTokenCommand
        {
            TenantId = tenantId,
            Name = "Active Status Test",
            ExpiresAt = DateTime.UtcNow.AddMonths(6)
        };

        ScimToken? capturedToken = null;
        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<ScimToken>(), It.IsAny<CancellationToken>()))
            .Callback<ScimToken, CancellationToken>((t, ct) => capturedToken = t)
            .ReturnsAsync((ScimToken token, CancellationToken ct) => token);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        capturedToken!.Status.Should().Be(ScimTokenStatus.Active);
        result.Value!.Status.Should().Be(ScimTokenStatus.Active);
    }
}
