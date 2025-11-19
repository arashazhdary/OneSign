using FluentAssertions;
using Moq;
using Onesign.Modules.Identity.Application.Commands;
using Onesign.Modules.Identity.Domain.Entities;
using Onesign.Modules.Identity.Domain.Enums;
using Onesign.Modules.Identity.Domain.Repositories;
using Onesign.Shared.Email;
using Xunit;

namespace Onesign.Api.Tests.Identity;

public class RequestPasswordResetCommandHandlerTests
{
    private readonly Mock<IGlobalUserRepository> _globalUserRepositoryMock;
    private readonly Mock<ITenantUserRepository> _tenantUserRepositoryMock;
    private readonly Mock<IPasswordResetTokenRepository> _passwordResetTokenRepositoryMock;
    private readonly Mock<IEmailService> _emailServiceMock;
    private readonly RequestPasswordResetCommandHandler _handler;

    public RequestPasswordResetCommandHandlerTests()
    {
        _globalUserRepositoryMock = new Mock<IGlobalUserRepository>();
        _tenantUserRepositoryMock = new Mock<ITenantUserRepository>();
        _passwordResetTokenRepositoryMock = new Mock<IPasswordResetTokenRepository>();
        _emailServiceMock = new Mock<IEmailService>();

        _handler = new RequestPasswordResetCommandHandler(
            _globalUserRepositoryMock.Object,
            _tenantUserRepositoryMock.Object,
            _passwordResetTokenRepositoryMock.Object,
            _emailServiceMock.Object);
    }

    #region Successful Request Tests

    [Fact]
    public async Task Handle_ValidUser_ReturnsSuccessWithToken()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var globalUserId = Guid.NewGuid();
        var tenantUserId = Guid.NewGuid();
        var email = "test@example.com";

        var globalUser = new GlobalUser
        {
            Id = globalUserId,
            Email = email
        };

        var tenantUser = new TenantUser
        {
            Id = tenantUserId,
            GlobalUserId = globalUserId,
            TenantId = tenantId,
            Status = TenantUserStatus.Active
        };

        _globalUserRepositoryMock
            .Setup(x => x.GetByEmailAsync(email, It.IsAny<CancellationToken>()))
            .ReturnsAsync(globalUser);

        _tenantUserRepositoryMock
            .Setup(x => x.GetByGlobalUserIdAndTenantIdAsync(globalUserId, tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenantUser);

        _passwordResetTokenRepositoryMock
            .Setup(x => x.AddAsync(It.IsAny<PasswordResetToken>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PasswordResetToken token, CancellationToken _) => token);

        _emailServiceMock
            .Setup(x => x.SendEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var command = new RequestPasswordResetCommand
        {
            TenantId = tenantId,
            Email = email
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task Handle_ValidUser_CreatesPasswordResetToken()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var globalUserId = Guid.NewGuid();
        var tenantUserId = Guid.NewGuid();
        var email = "test@example.com";

        var globalUser = new GlobalUser
        {
            Id = globalUserId,
            Email = email
        };

        var tenantUser = new TenantUser
        {
            Id = tenantUserId,
            GlobalUserId = globalUserId,
            TenantId = tenantId
        };

        _globalUserRepositoryMock
            .Setup(x => x.GetByEmailAsync(email, It.IsAny<CancellationToken>()))
            .ReturnsAsync(globalUser);

        _tenantUserRepositoryMock
            .Setup(x => x.GetByGlobalUserIdAndTenantIdAsync(globalUserId, tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenantUser);

        PasswordResetToken? savedToken = null;
        _passwordResetTokenRepositoryMock
            .Setup(x => x.AddAsync(It.IsAny<PasswordResetToken>(), It.IsAny<CancellationToken>()))
            .Callback<PasswordResetToken, CancellationToken>((token, _) => savedToken = token)
            .ReturnsAsync((PasswordResetToken token, CancellationToken _) => token);

        var command = new RequestPasswordResetCommand
        {
            TenantId = tenantId,
            Email = email
        };

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        savedToken.Should().NotBeNull();
        savedToken!.TenantUserId.Should().Be(tenantUserId);
        savedToken.IsUsed.Should().BeFalse();
        savedToken.Token.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task Handle_ValidUser_SetsTokenExpiration24Hours()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var globalUserId = Guid.NewGuid();
        var tenantUserId = Guid.NewGuid();
        var email = "test@example.com";

        var globalUser = new GlobalUser
        {
            Id = globalUserId,
            Email = email
        };

        var tenantUser = new TenantUser
        {
            Id = tenantUserId,
            GlobalUserId = globalUserId,
            TenantId = tenantId
        };

        _globalUserRepositoryMock
            .Setup(x => x.GetByEmailAsync(email, It.IsAny<CancellationToken>()))
            .ReturnsAsync(globalUser);

        _tenantUserRepositoryMock
            .Setup(x => x.GetByGlobalUserIdAndTenantIdAsync(globalUserId, tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenantUser);

        PasswordResetToken? savedToken = null;
        _passwordResetTokenRepositoryMock
            .Setup(x => x.AddAsync(It.IsAny<PasswordResetToken>(), It.IsAny<CancellationToken>()))
            .Callback<PasswordResetToken, CancellationToken>((token, _) => savedToken = token)
            .ReturnsAsync((PasswordResetToken token, CancellationToken _) => token);

        var command = new RequestPasswordResetCommand
        {
            TenantId = tenantId,
            Email = email
        };

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        savedToken!.ExpiresAt.Should().BeCloseTo(DateTime.UtcNow.AddHours(24), TimeSpan.FromSeconds(5));
    }

    [Fact]
    public async Task Handle_ValidUser_SendsEmailWithToken()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var globalUserId = Guid.NewGuid();
        var tenantUserId = Guid.NewGuid();
        var email = "test@example.com";

        var globalUser = new GlobalUser
        {
            Id = globalUserId,
            Email = email
        };

        var tenantUser = new TenantUser
        {
            Id = tenantUserId,
            GlobalUserId = globalUserId,
            TenantId = tenantId
        };

        _globalUserRepositoryMock
            .Setup(x => x.GetByEmailAsync(email, It.IsAny<CancellationToken>()))
            .ReturnsAsync(globalUser);

        _tenantUserRepositoryMock
            .Setup(x => x.GetByGlobalUserIdAndTenantIdAsync(globalUserId, tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenantUser);

        _passwordResetTokenRepositoryMock
            .Setup(x => x.AddAsync(It.IsAny<PasswordResetToken>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PasswordResetToken token, CancellationToken _) => token);

        string? sentEmail = null;
        string? sentSubject = null;
        string? sentBody = null;
        _emailServiceMock
            .Setup(x => x.SendEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<CancellationToken>()))
            .Callback<string, string, string, bool, CancellationToken>((e, s, b, _, _) =>
            {
                sentEmail = e;
                sentSubject = s;
                sentBody = b;
            })
            .Returns(Task.CompletedTask);

        var command = new RequestPasswordResetCommand
        {
            TenantId = tenantId,
            Email = email
        };

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        sentEmail.Should().Be(email);
        sentSubject.Should().Be("Password Reset Request");
        sentBody.Should().Contain("reset-password");
        sentBody.Should().Contain("token=");
        sentBody.Should().Contain($"tenantId={tenantId}");
    }

    [Fact]
    public async Task Handle_ValidUser_GeneratesSecureToken()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var globalUserId = Guid.NewGuid();
        var tenantUserId = Guid.NewGuid();
        var email = "test@example.com";

        var globalUser = new GlobalUser
        {
            Id = globalUserId,
            Email = email
        };

        var tenantUser = new TenantUser
        {
            Id = tenantUserId,
            GlobalUserId = globalUserId,
            TenantId = tenantId
        };

        _globalUserRepositoryMock
            .Setup(x => x.GetByEmailAsync(email, It.IsAny<CancellationToken>()))
            .ReturnsAsync(globalUser);

        _tenantUserRepositoryMock
            .Setup(x => x.GetByGlobalUserIdAndTenantIdAsync(globalUserId, tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenantUser);

        _passwordResetTokenRepositoryMock
            .Setup(x => x.AddAsync(It.IsAny<PasswordResetToken>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PasswordResetToken token, CancellationToken _) => token);

        var command = new RequestPasswordResetCommand
        {
            TenantId = tenantId,
            Email = email
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Value.Should().NotContain("+");
        result.Value.Should().NotContain("/");
        result.Value.Should().NotContain("=");
        result.Value.Length.Should().BeGreaterOrEqualTo(32); // Cryptographically secure token
    }

    #endregion

    #region User Not Found Tests

    [Fact]
    public async Task Handle_UserNotFound_ReturnsFailure()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var email = "nonexistent@example.com";

        _globalUserRepositoryMock
            .Setup(x => x.GetByEmailAsync(email, It.IsAny<CancellationToken>()))
            .ReturnsAsync((GlobalUser?)null);

        var command = new RequestPasswordResetCommand
        {
            TenantId = tenantId,
            Email = email
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("USER_NOT_FOUND");
    }

    [Fact]
    public async Task Handle_UserNotFound_DoesNotSendEmail()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var email = "nonexistent@example.com";

        _globalUserRepositoryMock
            .Setup(x => x.GetByEmailAsync(email, It.IsAny<CancellationToken>()))
            .ReturnsAsync((GlobalUser?)null);

        var command = new RequestPasswordResetCommand
        {
            TenantId = tenantId,
            Email = email
        };

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _emailServiceMock.Verify(x => x.SendEmailAsync(
            It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    #endregion

    #region User Not In Tenant Tests

    [Fact]
    public async Task Handle_UserNotInTenant_ReturnsFailure()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var globalUserId = Guid.NewGuid();
        var email = "test@example.com";

        var globalUser = new GlobalUser
        {
            Id = globalUserId,
            Email = email
        };

        _globalUserRepositoryMock
            .Setup(x => x.GetByEmailAsync(email, It.IsAny<CancellationToken>()))
            .ReturnsAsync(globalUser);

        _tenantUserRepositoryMock
            .Setup(x => x.GetByGlobalUserIdAndTenantIdAsync(globalUserId, tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TenantUser?)null);

        var command = new RequestPasswordResetCommand
        {
            TenantId = tenantId,
            Email = email
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("USER_NOT_IN_TENANT");
    }

    [Fact]
    public async Task Handle_UserNotInTenant_DoesNotCreateToken()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var globalUserId = Guid.NewGuid();
        var email = "test@example.com";

        var globalUser = new GlobalUser
        {
            Id = globalUserId,
            Email = email
        };

        _globalUserRepositoryMock
            .Setup(x => x.GetByEmailAsync(email, It.IsAny<CancellationToken>()))
            .ReturnsAsync(globalUser);

        _tenantUserRepositoryMock
            .Setup(x => x.GetByGlobalUserIdAndTenantIdAsync(globalUserId, tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TenantUser?)null);

        var command = new RequestPasswordResetCommand
        {
            TenantId = tenantId,
            Email = email
        };

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _passwordResetTokenRepositoryMock.Verify(x => x.AddAsync(
            It.IsAny<PasswordResetToken>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    #endregion

    #region No Email Service Tests

    [Fact]
    public async Task Handle_NoEmailService_StillReturnsSuccess()
    {
        // Arrange
        var handlerWithoutEmail = new RequestPasswordResetCommandHandler(
            _globalUserRepositoryMock.Object,
            _tenantUserRepositoryMock.Object,
            _passwordResetTokenRepositoryMock.Object,
            null); // No email service

        var tenantId = Guid.NewGuid();
        var globalUserId = Guid.NewGuid();
        var tenantUserId = Guid.NewGuid();
        var email = "test@example.com";

        var globalUser = new GlobalUser
        {
            Id = globalUserId,
            Email = email
        };

        var tenantUser = new TenantUser
        {
            Id = tenantUserId,
            GlobalUserId = globalUserId,
            TenantId = tenantId
        };

        _globalUserRepositoryMock
            .Setup(x => x.GetByEmailAsync(email, It.IsAny<CancellationToken>()))
            .ReturnsAsync(globalUser);

        _tenantUserRepositoryMock
            .Setup(x => x.GetByGlobalUserIdAndTenantIdAsync(globalUserId, tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenantUser);

        _passwordResetTokenRepositoryMock
            .Setup(x => x.AddAsync(It.IsAny<PasswordResetToken>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PasswordResetToken token, CancellationToken _) => token);

        var command = new RequestPasswordResetCommand
        {
            TenantId = tenantId,
            Email = email
        };

        // Act
        var result = await handlerWithoutEmail.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNullOrEmpty();
    }

    #endregion

    #region Token Uniqueness Tests

    [Fact]
    public async Task Handle_MultipleRequests_GeneratesUniqueTokens()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var globalUserId = Guid.NewGuid();
        var tenantUserId = Guid.NewGuid();
        var email = "test@example.com";

        var globalUser = new GlobalUser
        {
            Id = globalUserId,
            Email = email
        };

        var tenantUser = new TenantUser
        {
            Id = tenantUserId,
            GlobalUserId = globalUserId,
            TenantId = tenantId
        };

        _globalUserRepositoryMock
            .Setup(x => x.GetByEmailAsync(email, It.IsAny<CancellationToken>()))
            .ReturnsAsync(globalUser);

        _tenantUserRepositoryMock
            .Setup(x => x.GetByGlobalUserIdAndTenantIdAsync(globalUserId, tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenantUser);

        _passwordResetTokenRepositoryMock
            .Setup(x => x.AddAsync(It.IsAny<PasswordResetToken>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PasswordResetToken token, CancellationToken _) => token);

        var command = new RequestPasswordResetCommand
        {
            TenantId = tenantId,
            Email = email
        };

        // Act
        var result1 = await _handler.Handle(command, CancellationToken.None);
        var result2 = await _handler.Handle(command, CancellationToken.None);
        var result3 = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result1.Value.Should().NotBe(result2.Value);
        result2.Value.Should().NotBe(result3.Value);
        result1.Value.Should().NotBe(result3.Value);
    }

    #endregion
}
