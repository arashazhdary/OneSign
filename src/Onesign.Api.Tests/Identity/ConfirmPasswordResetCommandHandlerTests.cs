using FluentAssertions;
using Moq;
using Onesign.Modules.Identity.Application.Commands;
using Onesign.Modules.Identity.Domain.Entities;
using Onesign.Modules.Identity.Domain.Enums;
using Onesign.Modules.Identity.Domain.Repositories;
using Onesign.Modules.Identity.Domain.Services;
using Xunit;

namespace Onesign.Api.Tests.Identity;

public class ConfirmPasswordResetCommandHandlerTests
{
    private readonly Mock<IPasswordResetTokenRepository> _passwordResetTokenRepositoryMock;
    private readonly Mock<ITenantUserRepository> _tenantUserRepositoryMock;
    private readonly Mock<IGlobalUserRepository> _globalUserRepositoryMock;
    private readonly Mock<IPasswordHasher> _passwordHasherMock;
    private readonly ConfirmPasswordResetCommandHandler _handler;

    public ConfirmPasswordResetCommandHandlerTests()
    {
        _passwordResetTokenRepositoryMock = new Mock<IPasswordResetTokenRepository>();
        _tenantUserRepositoryMock = new Mock<ITenantUserRepository>();
        _globalUserRepositoryMock = new Mock<IGlobalUserRepository>();
        _passwordHasherMock = new Mock<IPasswordHasher>();

        _handler = new ConfirmPasswordResetCommandHandler(
            _passwordResetTokenRepositoryMock.Object,
            _tenantUserRepositoryMock.Object,
            _globalUserRepositoryMock.Object,
            _passwordHasherMock.Object);
    }

    #region Successful Reset Tests

    [Fact]
    public async Task Handle_ValidToken_ReturnsSuccess()
    {
        // Arrange
        var token = "valid-token";
        var newPassword = "NewPassword123!";
        var tenantUserId = Guid.NewGuid();
        var globalUserId = Guid.NewGuid();

        var resetToken = new PasswordResetToken
        {
            Id = Guid.NewGuid(),
            Token = token,
            TenantUserId = tenantUserId,
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            IsUsed = false
        };

        var tenantUser = new TenantUser
        {
            Id = tenantUserId,
            GlobalUserId = globalUserId,
            TenantId = Guid.NewGuid(),
            Status = TenantUserStatus.Active
        };

        var globalUser = new GlobalUser
        {
            Id = globalUserId,
            Email = "test@example.com",
            PasswordHash = "old-hash"
        };

        SetupSuccessfulReset(resetToken, tenantUser, globalUser, newPassword);

        var command = new ConfirmPasswordResetCommand
        {
            Token = token,
            NewPassword = newPassword
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_ValidToken_UpdatesPasswordHash()
    {
        // Arrange
        var token = "valid-token";
        var newPassword = "NewPassword123!";
        var hashedPassword = "hashed-new-password";
        var tenantUserId = Guid.NewGuid();
        var globalUserId = Guid.NewGuid();

        var resetToken = new PasswordResetToken
        {
            Id = Guid.NewGuid(),
            Token = token,
            TenantUserId = tenantUserId,
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            IsUsed = false
        };

        var tenantUser = new TenantUser
        {
            Id = tenantUserId,
            GlobalUserId = globalUserId,
            TenantId = Guid.NewGuid()
        };

        var globalUser = new GlobalUser
        {
            Id = globalUserId,
            Email = "test@example.com",
            PasswordHash = "old-hash"
        };

        _passwordResetTokenRepositoryMock
            .Setup(x => x.GetByTokenAsync(token, It.IsAny<CancellationToken>()))
            .ReturnsAsync(resetToken);

        _tenantUserRepositoryMock
            .Setup(x => x.GetByIdAsync(tenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenantUser);

        _globalUserRepositoryMock
            .Setup(x => x.GetByIdAsync(globalUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(globalUser);

        _passwordHasherMock
            .Setup(x => x.HashPassword(newPassword))
            .Returns(hashedPassword);

        GlobalUser? updatedUser = null;
        _globalUserRepositoryMock
            .Setup(x => x.UpdateAsync(It.IsAny<GlobalUser>(), It.IsAny<CancellationToken>()))
            .Callback<GlobalUser, CancellationToken>((user, _) => updatedUser = user)
            .Returns(Task.CompletedTask);

        _passwordResetTokenRepositoryMock
            .Setup(x => x.UpdateAsync(It.IsAny<PasswordResetToken>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var command = new ConfirmPasswordResetCommand
        {
            Token = token,
            NewPassword = newPassword
        };

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        updatedUser.Should().NotBeNull();
        updatedUser!.PasswordHash.Should().Be(hashedPassword);
    }

    [Fact]
    public async Task Handle_ValidToken_MarksTokenAsUsed()
    {
        // Arrange
        var token = "valid-token";
        var newPassword = "NewPassword123!";
        var tenantUserId = Guid.NewGuid();
        var globalUserId = Guid.NewGuid();

        var resetToken = new PasswordResetToken
        {
            Id = Guid.NewGuid(),
            Token = token,
            TenantUserId = tenantUserId,
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            IsUsed = false
        };

        var tenantUser = new TenantUser
        {
            Id = tenantUserId,
            GlobalUserId = globalUserId,
            TenantId = Guid.NewGuid()
        };

        var globalUser = new GlobalUser
        {
            Id = globalUserId,
            Email = "test@example.com"
        };

        SetupSuccessfulReset(resetToken, tenantUser, globalUser, newPassword);

        PasswordResetToken? updatedToken = null;
        _passwordResetTokenRepositoryMock
            .Setup(x => x.UpdateAsync(It.IsAny<PasswordResetToken>(), It.IsAny<CancellationToken>()))
            .Callback<PasswordResetToken, CancellationToken>((t, _) => updatedToken = t)
            .Returns(Task.CompletedTask);

        var command = new ConfirmPasswordResetCommand
        {
            Token = token,
            NewPassword = newPassword
        };

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        updatedToken.Should().NotBeNull();
        updatedToken!.IsUsed.Should().BeTrue();
    }

    #endregion

    #region Invalid Token Tests

    [Fact]
    public async Task Handle_TokenNotFound_ReturnsInvalidToken()
    {
        // Arrange
        var token = "invalid-token";

        _passwordResetTokenRepositoryMock
            .Setup(x => x.GetByTokenAsync(token, It.IsAny<CancellationToken>()))
            .ReturnsAsync((PasswordResetToken?)null);

        var command = new ConfirmPasswordResetCommand
        {
            Token = token,
            NewPassword = "NewPassword123!"
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("INVALID_TOKEN");
    }

    [Fact]
    public async Task Handle_TokenAlreadyUsed_ReturnsTokenAlreadyUsed()
    {
        // Arrange
        var token = "used-token";

        var resetToken = new PasswordResetToken
        {
            Id = Guid.NewGuid(),
            Token = token,
            TenantUserId = Guid.NewGuid(),
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            IsUsed = true // Already used
        };

        _passwordResetTokenRepositoryMock
            .Setup(x => x.GetByTokenAsync(token, It.IsAny<CancellationToken>()))
            .ReturnsAsync(resetToken);

        var command = new ConfirmPasswordResetCommand
        {
            Token = token,
            NewPassword = "NewPassword123!"
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("TOKEN_ALREADY_USED");
    }

    [Fact]
    public async Task Handle_TokenExpired_ReturnsTokenExpired()
    {
        // Arrange
        var token = "expired-token";

        var resetToken = new PasswordResetToken
        {
            Id = Guid.NewGuid(),
            Token = token,
            TenantUserId = Guid.NewGuid(),
            ExpiresAt = DateTime.UtcNow.AddHours(-1), // Expired
            IsUsed = false
        };

        _passwordResetTokenRepositoryMock
            .Setup(x => x.GetByTokenAsync(token, It.IsAny<CancellationToken>()))
            .ReturnsAsync(resetToken);

        var command = new ConfirmPasswordResetCommand
        {
            Token = token,
            NewPassword = "NewPassword123!"
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("TOKEN_EXPIRED");
    }

    [Fact]
    public async Task Handle_TokenJustExpired_ReturnsTokenExpired()
    {
        // Arrange
        var token = "just-expired-token";

        var resetToken = new PasswordResetToken
        {
            Id = Guid.NewGuid(),
            Token = token,
            TenantUserId = Guid.NewGuid(),
            ExpiresAt = DateTime.UtcNow.AddSeconds(-1), // Just expired
            IsUsed = false
        };

        _passwordResetTokenRepositoryMock
            .Setup(x => x.GetByTokenAsync(token, It.IsAny<CancellationToken>()))
            .ReturnsAsync(resetToken);

        var command = new ConfirmPasswordResetCommand
        {
            Token = token,
            NewPassword = "NewPassword123!"
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("TOKEN_EXPIRED");
    }

    #endregion

    #region User Not Found Tests

    [Fact]
    public async Task Handle_TenantUserNotFound_ReturnsUserNotFound()
    {
        // Arrange
        var token = "valid-token";
        var tenantUserId = Guid.NewGuid();

        var resetToken = new PasswordResetToken
        {
            Id = Guid.NewGuid(),
            Token = token,
            TenantUserId = tenantUserId,
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            IsUsed = false
        };

        _passwordResetTokenRepositoryMock
            .Setup(x => x.GetByTokenAsync(token, It.IsAny<CancellationToken>()))
            .ReturnsAsync(resetToken);

        _tenantUserRepositoryMock
            .Setup(x => x.GetByIdAsync(tenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TenantUser?)null);

        var command = new ConfirmPasswordResetCommand
        {
            Token = token,
            NewPassword = "NewPassword123!"
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("USER_NOT_FOUND");
    }

    [Fact]
    public async Task Handle_GlobalUserNotFound_ReturnsUserNotFound()
    {
        // Arrange
        var token = "valid-token";
        var tenantUserId = Guid.NewGuid();
        var globalUserId = Guid.NewGuid();

        var resetToken = new PasswordResetToken
        {
            Id = Guid.NewGuid(),
            Token = token,
            TenantUserId = tenantUserId,
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            IsUsed = false
        };

        var tenantUser = new TenantUser
        {
            Id = tenantUserId,
            GlobalUserId = globalUserId,
            TenantId = Guid.NewGuid()
        };

        _passwordResetTokenRepositoryMock
            .Setup(x => x.GetByTokenAsync(token, It.IsAny<CancellationToken>()))
            .ReturnsAsync(resetToken);

        _tenantUserRepositoryMock
            .Setup(x => x.GetByIdAsync(tenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenantUser);

        _globalUserRepositoryMock
            .Setup(x => x.GetByIdAsync(globalUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((GlobalUser?)null);

        var command = new ConfirmPasswordResetCommand
        {
            Token = token,
            NewPassword = "NewPassword123!"
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("USER_NOT_FOUND");
    }

    #endregion

    #region Edge Cases

    [Fact]
    public async Task Handle_EmptyPassword_HashesEmptyString()
    {
        // Arrange
        var token = "valid-token";
        var newPassword = "";
        var tenantUserId = Guid.NewGuid();
        var globalUserId = Guid.NewGuid();

        var resetToken = new PasswordResetToken
        {
            Id = Guid.NewGuid(),
            Token = token,
            TenantUserId = tenantUserId,
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            IsUsed = false
        };

        var tenantUser = new TenantUser
        {
            Id = tenantUserId,
            GlobalUserId = globalUserId,
            TenantId = Guid.NewGuid()
        };

        var globalUser = new GlobalUser
        {
            Id = globalUserId,
            Email = "test@example.com"
        };

        SetupSuccessfulReset(resetToken, tenantUser, globalUser, newPassword);

        var command = new ConfirmPasswordResetCommand
        {
            Token = token,
            NewPassword = newPassword
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        _passwordHasherMock.Verify(x => x.HashPassword(""), Times.Once);
    }

    [Fact]
    public async Task Handle_VeryLongPassword_HashesCorrectly()
    {
        // Arrange
        var token = "valid-token";
        var newPassword = new string('a', 1000);
        var tenantUserId = Guid.NewGuid();
        var globalUserId = Guid.NewGuid();

        var resetToken = new PasswordResetToken
        {
            Id = Guid.NewGuid(),
            Token = token,
            TenantUserId = tenantUserId,
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            IsUsed = false
        };

        var tenantUser = new TenantUser
        {
            Id = tenantUserId,
            GlobalUserId = globalUserId,
            TenantId = Guid.NewGuid()
        };

        var globalUser = new GlobalUser
        {
            Id = globalUserId,
            Email = "test@example.com"
        };

        SetupSuccessfulReset(resetToken, tenantUser, globalUser, newPassword);

        var command = new ConfirmPasswordResetCommand
        {
            Token = token,
            NewPassword = newPassword
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        _passwordHasherMock.Verify(x => x.HashPassword(newPassword), Times.Once);
    }

    [Fact]
    public async Task Handle_TokenNotFound_DoesNotUpdatePassword()
    {
        // Arrange
        var token = "invalid-token";

        _passwordResetTokenRepositoryMock
            .Setup(x => x.GetByTokenAsync(token, It.IsAny<CancellationToken>()))
            .ReturnsAsync((PasswordResetToken?)null);

        var command = new ConfirmPasswordResetCommand
        {
            Token = token,
            NewPassword = "NewPassword123!"
        };

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _globalUserRepositoryMock.Verify(x => x.UpdateAsync(
            It.IsAny<GlobalUser>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Handle_TokenAlreadyUsed_DoesNotUpdatePassword()
    {
        // Arrange
        var token = "used-token";

        var resetToken = new PasswordResetToken
        {
            Id = Guid.NewGuid(),
            Token = token,
            TenantUserId = Guid.NewGuid(),
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            IsUsed = true
        };

        _passwordResetTokenRepositoryMock
            .Setup(x => x.GetByTokenAsync(token, It.IsAny<CancellationToken>()))
            .ReturnsAsync(resetToken);

        var command = new ConfirmPasswordResetCommand
        {
            Token = token,
            NewPassword = "NewPassword123!"
        };

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _globalUserRepositoryMock.Verify(x => x.UpdateAsync(
            It.IsAny<GlobalUser>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    #endregion

    #region Helper Methods

    private void SetupSuccessfulReset(PasswordResetToken resetToken, TenantUser tenantUser, GlobalUser globalUser, string newPassword)
    {
        _passwordResetTokenRepositoryMock
            .Setup(x => x.GetByTokenAsync(resetToken.Token, It.IsAny<CancellationToken>()))
            .ReturnsAsync(resetToken);

        _tenantUserRepositoryMock
            .Setup(x => x.GetByIdAsync(tenantUser.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenantUser);

        _globalUserRepositoryMock
            .Setup(x => x.GetByIdAsync(globalUser.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(globalUser);

        _passwordHasherMock
            .Setup(x => x.HashPassword(newPassword))
            .Returns("hashed-password");

        _globalUserRepositoryMock
            .Setup(x => x.UpdateAsync(It.IsAny<GlobalUser>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        _passwordResetTokenRepositoryMock
            .Setup(x => x.UpdateAsync(It.IsAny<PasswordResetToken>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
    }

    #endregion
}
