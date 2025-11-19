using FluentAssertions;
using MediatR;
using Microsoft.Extensions.Logging;
using Moq;
using Onesign.Modules.Crypto.Application.Commands;
using Onesign.Modules.Crypto.Domain.Entities;
using Onesign.Modules.Crypto.Domain.Services;

namespace Onesign.Api.Tests.Crypto;

public class CryptoCommandHandlerTests
{
    private readonly Mock<IKeyRolloverService> _keyRolloverServiceMock;
    private readonly Mock<IKeyRevocationService> _keyRevocationServiceMock;
    private readonly Mock<ILogger<RolloverKeyCommandHandler>> _rolloverLoggerMock;
    private readonly Mock<ILogger<RevokeKeyVersionCommandHandler>> _revokeLoggerMock;
    private readonly RolloverKeyCommandHandler _rolloverHandler;
    private readonly RevokeKeyVersionCommandHandler _revokeHandler;

    public CryptoCommandHandlerTests()
    {
        _keyRolloverServiceMock = new Mock<IKeyRolloverService>();
        _keyRevocationServiceMock = new Mock<IKeyRevocationService>();
        _rolloverLoggerMock = new Mock<ILogger<RolloverKeyCommandHandler>>();
        _revokeLoggerMock = new Mock<ILogger<RevokeKeyVersionCommandHandler>>();

        _rolloverHandler = new RolloverKeyCommandHandler(
            _keyRolloverServiceMock.Object,
            _rolloverLoggerMock.Object);

        _revokeHandler = new RevokeKeyVersionCommandHandler(
            _keyRevocationServiceMock.Object,
            _revokeLoggerMock.Object);
    }

    #region RolloverKeyCommandHandler Tests

    [Fact]
    public async Task RolloverKey_WithValidKeySetId_ReturnsSuccess()
    {
        // Arrange
        var keySetId = Guid.NewGuid();
        var newKeyVersionId = Guid.NewGuid();
        var kid = "key-2024-01";
        var activatedAt = DateTime.UtcNow;

        var command = new RolloverKeyCommand { KeySetId = keySetId };

        var newKeyVersion = new KeyVersion
        {
            Id = newKeyVersionId,
            Kid = kid,
            ActivatedAt = activatedAt
        };

        _keyRolloverServiceMock
            .Setup(x => x.RolloverAsync(keySetId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(newKeyVersion);

        // Act
        var result = await _rolloverHandler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.NewKeyVersionId.Should().Be(newKeyVersionId);
        result.Value.Kid.Should().Be(kid);
        result.Value.ActivatedAt.Should().Be(activatedAt);
    }

    [Fact]
    public async Task RolloverKey_WhenServiceThrowsException_ReturnsFailure()
    {
        // Arrange
        var keySetId = Guid.NewGuid();
        var command = new RolloverKeyCommand { KeySetId = keySetId };

        _keyRolloverServiceMock
            .Setup(x => x.RolloverAsync(keySetId, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception("Key set not found"));

        // Act
        var result = await _rolloverHandler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("KEY_ROLLOVER_FAILED");
        result.ErrorMessage.Should().Contain("Key set not found");
    }

    [Fact]
    public async Task RolloverKey_CallsServiceWithCorrectKeySetId()
    {
        // Arrange
        var keySetId = Guid.NewGuid();
        var command = new RolloverKeyCommand { KeySetId = keySetId };

        _keyRolloverServiceMock
            .Setup(x => x.RolloverAsync(keySetId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new KeyVersion { Id = Guid.NewGuid(), Kid = "test", ActivatedAt = DateTime.UtcNow });

        // Act
        await _rolloverHandler.Handle(command, CancellationToken.None);

        // Assert
        _keyRolloverServiceMock.Verify(x => x.RolloverAsync(keySetId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task RolloverKey_LogsInformationOnSuccess()
    {
        // Arrange
        var keySetId = Guid.NewGuid();
        var command = new RolloverKeyCommand { KeySetId = keySetId };

        _keyRolloverServiceMock
            .Setup(x => x.RolloverAsync(keySetId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new KeyVersion { Id = Guid.NewGuid(), Kid = "test", ActivatedAt = DateTime.UtcNow });

        // Act
        await _rolloverHandler.Handle(command, CancellationToken.None);

        // Assert
        _rolloverLoggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => true),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.AtLeast(1));
    }

    #endregion

    #region RevokeKeyVersionCommandHandler Tests

    [Fact]
    public async Task RevokeKeyVersion_WithValidKeyVersionId_ReturnsSuccess()
    {
        // Arrange
        var keyVersionId = Guid.NewGuid();
        var reason = "Compromised key";

        var command = new RevokeKeyVersionCommand
        {
            KeyVersionId = keyVersionId,
            Reason = reason
        };

        _keyRevocationServiceMock
            .Setup(x => x.RevokeAsync(keyVersionId, reason, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _revokeHandler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().Be(Unit.Value);
    }

    [Fact]
    public async Task RevokeKeyVersion_WhenServiceThrowsException_ReturnsFailure()
    {
        // Arrange
        var keyVersionId = Guid.NewGuid();
        var command = new RevokeKeyVersionCommand
        {
            KeyVersionId = keyVersionId,
            Reason = "Test"
        };

        _keyRevocationServiceMock
            .Setup(x => x.RevokeAsync(keyVersionId, It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception("Key version not found"));

        // Act
        var result = await _revokeHandler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("KEY_REVOCATION_FAILED");
        result.ErrorMessage.Should().Contain("Key version not found");
    }

    [Fact]
    public async Task RevokeKeyVersion_CallsServiceWithCorrectParameters()
    {
        // Arrange
        var keyVersionId = Guid.NewGuid();
        var reason = "Security breach";
        var command = new RevokeKeyVersionCommand
        {
            KeyVersionId = keyVersionId,
            Reason = reason
        };

        _keyRevocationServiceMock
            .Setup(x => x.RevokeAsync(keyVersionId, reason, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await _revokeHandler.Handle(command, CancellationToken.None);

        // Assert
        _keyRevocationServiceMock.Verify(
            x => x.RevokeAsync(keyVersionId, reason, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task RevokeKeyVersion_LogsErrorOnException()
    {
        // Arrange
        var keyVersionId = Guid.NewGuid();
        var command = new RevokeKeyVersionCommand
        {
            KeyVersionId = keyVersionId,
            Reason = "Test"
        };

        _keyRevocationServiceMock
            .Setup(x => x.RevokeAsync(keyVersionId, It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception("Test error"));

        // Act
        await _revokeHandler.Handle(command, CancellationToken.None);

        // Assert
        _revokeLoggerMock.Verify(
            x => x.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => true),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task RevokeKeyVersion_WithEmptyReason_StillCallsService()
    {
        // Arrange
        var keyVersionId = Guid.NewGuid();
        var command = new RevokeKeyVersionCommand
        {
            KeyVersionId = keyVersionId,
            Reason = string.Empty
        };

        _keyRevocationServiceMock
            .Setup(x => x.RevokeAsync(keyVersionId, string.Empty, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _revokeHandler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        _keyRevocationServiceMock.Verify(
            x => x.RevokeAsync(keyVersionId, string.Empty, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    #endregion
}
