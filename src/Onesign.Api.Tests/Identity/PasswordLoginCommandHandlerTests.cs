using FluentAssertions;
using MediatR;
using Microsoft.Extensions.Logging;
using Moq;
using Onesign.Modules.Audit.Application.Commands;
using Onesign.Modules.Identity.Application.Commands;
using Onesign.Modules.Identity.Application.DTOs;
using Onesign.Modules.Identity.Domain.Entities;
using Onesign.Modules.Identity.Domain.Enums;
using Onesign.Modules.Identity.Domain.Repositories;
using Onesign.Modules.Identity.Domain.Services;
using Onesign.Modules.Security.Application.Commands;
using Onesign.Modules.Security.Application.Queries;
using Onesign.Shared.Result;
using Xunit;

namespace Onesign.Api.Tests.Identity;

public class PasswordLoginCommandHandlerTests
{
    private readonly Mock<IGlobalUserRepository> _globalUserRepositoryMock;
    private readonly Mock<ITenantUserRepository> _tenantUserRepositoryMock;
    private readonly Mock<IPasswordHasher> _passwordHasherMock;
    private readonly Mock<IAuthService> _authServiceMock;
    private readonly Mock<IUserLoginSessionRepository> _userLoginSessionRepositoryMock;
    private readonly Mock<IMediator> _mediatorMock;
    private readonly Mock<ILogger<PasswordLoginCommandHandler>> _loggerMock;
    private readonly PasswordLoginCommandHandler _handler;

    public PasswordLoginCommandHandlerTests()
    {
        _globalUserRepositoryMock = new Mock<IGlobalUserRepository>();
        _tenantUserRepositoryMock = new Mock<ITenantUserRepository>();
        _passwordHasherMock = new Mock<IPasswordHasher>();
        _authServiceMock = new Mock<IAuthService>();
        _userLoginSessionRepositoryMock = new Mock<IUserLoginSessionRepository>();
        _mediatorMock = new Mock<IMediator>();
        _loggerMock = new Mock<ILogger<PasswordLoginCommandHandler>>();

        _handler = new PasswordLoginCommandHandler(
            _globalUserRepositoryMock.Object,
            _tenantUserRepositoryMock.Object,
            _passwordHasherMock.Object,
            _authServiceMock.Object,
            _userLoginSessionRepositoryMock.Object,
            _mediatorMock.Object,
            _loggerMock.Object);
    }

    #region Successful Login Tests

    [Fact]
    public async Task Handle_ValidCredentials_ReturnsSuccessWithTokens()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var globalUserId = Guid.NewGuid();
        var tenantUserId = Guid.NewGuid();
        var email = "test@example.com";
        var password = "Password123!";
        var passwordHash = "hashed-password";

        var globalUser = new GlobalUser
        {
            Id = globalUserId,
            Email = email,
            PasswordHash = passwordHash,
            EmailVerified = true
        };

        var tenantUser = new TenantUser
        {
            Id = tenantUserId,
            GlobalUserId = globalUserId,
            TenantId = tenantId,
            Status = TenantUserStatus.Active,
            IsAdmin = false
        };

        SetupSuccessfulLogin(globalUser, tenantUser, password);

        var command = new PasswordLoginCommand
        {
            TenantId = tenantId,
            Email = email,
            Password = password
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.AccessToken.Should().Be("access-token");
        result.Value.IdToken.Should().Be("id-token");
        result.Value.TokenType.Should().Be("Bearer");
        result.Value.ExpiresIn.Should().Be(3600);
    }

    [Fact]
    public async Task Handle_ValidCredentials_UpdatesLastLoginAt()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var globalUserId = Guid.NewGuid();
        var tenantUserId = Guid.NewGuid();

        var globalUser = new GlobalUser
        {
            Id = globalUserId,
            Email = "test@example.com",
            PasswordHash = "hash"
        };

        var tenantUser = new TenantUser
        {
            Id = tenantUserId,
            GlobalUserId = globalUserId,
            TenantId = tenantId,
            Status = TenantUserStatus.Active
        };

        SetupSuccessfulLogin(globalUser, tenantUser, "password");

        var command = new PasswordLoginCommand
        {
            TenantId = tenantId,
            Email = "test@example.com",
            Password = "password"
        };

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _tenantUserRepositoryMock.Verify(x => x.UpdateAsync(
            It.Is<TenantUser>(u => u.LastLoginAt != null && u.LastLoginAt.Value.Date == DateTime.UtcNow.Date),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_FirstLogin_SetsFirstLoginAt()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var globalUserId = Guid.NewGuid();
        var tenantUserId = Guid.NewGuid();

        var globalUser = new GlobalUser
        {
            Id = globalUserId,
            Email = "test@example.com",
            PasswordHash = "hash"
        };

        var tenantUser = new TenantUser
        {
            Id = tenantUserId,
            GlobalUserId = globalUserId,
            TenantId = tenantId,
            Status = TenantUserStatus.Active,
            FirstLoginAt = null // First login
        };

        SetupSuccessfulLogin(globalUser, tenantUser, "password");

        var command = new PasswordLoginCommand
        {
            TenantId = tenantId,
            Email = "test@example.com",
            Password = "password"
        };

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _tenantUserRepositoryMock.Verify(x => x.UpdateAsync(
            It.Is<TenantUser>(u => u.FirstLoginAt != null),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ValidCredentials_CreatesLoginSession()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var globalUserId = Guid.NewGuid();
        var tenantUserId = Guid.NewGuid();

        var globalUser = new GlobalUser
        {
            Id = globalUserId,
            Email = "test@example.com",
            PasswordHash = "hash"
        };

        var tenantUser = new TenantUser
        {
            Id = tenantUserId,
            GlobalUserId = globalUserId,
            TenantId = tenantId,
            Status = TenantUserStatus.Active
        };

        SetupSuccessfulLogin(globalUser, tenantUser, "password");

        var command = new PasswordLoginCommand
        {
            TenantId = tenantId,
            Email = "test@example.com",
            Password = "password"
        };

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _userLoginSessionRepositoryMock.Verify(x => x.AddAsync(
            It.Is<UserLoginSession>(s => s.TenantUserId == tenantUserId),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ValidCredentials_LogsAuditEvent()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var globalUserId = Guid.NewGuid();
        var tenantUserId = Guid.NewGuid();

        var globalUser = new GlobalUser
        {
            Id = globalUserId,
            Email = "test@example.com",
            PasswordHash = "hash"
        };

        var tenantUser = new TenantUser
        {
            Id = tenantUserId,
            GlobalUserId = globalUserId,
            TenantId = tenantId,
            Status = TenantUserStatus.Active
        };

        SetupSuccessfulLogin(globalUser, tenantUser, "password");

        var command = new PasswordLoginCommand
        {
            TenantId = tenantId,
            Email = "test@example.com",
            Password = "password"
        };

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _mediatorMock.Verify(x => x.Send(
            It.IsAny<AppendAuditEventCommand>(),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    #endregion

    #region Invalid Credentials Tests

    [Fact]
    public async Task Handle_UserNotFound_ReturnsInvalidCredentials()
    {
        // Arrange
        _globalUserRepositoryMock
            .Setup(x => x.GetByEmailAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((GlobalUser?)null);

        var command = new PasswordLoginCommand
        {
            TenantId = Guid.NewGuid(),
            Email = "nonexistent@example.com",
            Password = "password"
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("INVALID_CREDENTIALS");
    }

    [Fact]
    public async Task Handle_NoPasswordHash_ReturnsInvalidCredentials()
    {
        // Arrange
        var globalUser = new GlobalUser
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            PasswordHash = null // No password set
        };

        _globalUserRepositoryMock
            .Setup(x => x.GetByEmailAsync("test@example.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(globalUser);

        var command = new PasswordLoginCommand
        {
            TenantId = Guid.NewGuid(),
            Email = "test@example.com",
            Password = "password"
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("INVALID_CREDENTIALS");
    }

    [Fact]
    public async Task Handle_EmptyPasswordHash_ReturnsInvalidCredentials()
    {
        // Arrange
        var globalUser = new GlobalUser
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            PasswordHash = "" // Empty password
        };

        _globalUserRepositoryMock
            .Setup(x => x.GetByEmailAsync("test@example.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(globalUser);

        var command = new PasswordLoginCommand
        {
            TenantId = Guid.NewGuid(),
            Email = "test@example.com",
            Password = "password"
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("INVALID_CREDENTIALS");
    }

    [Fact]
    public async Task Handle_WrongPassword_ReturnsInvalidCredentials()
    {
        // Arrange
        var globalUser = new GlobalUser
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            PasswordHash = "correct-hash"
        };

        _globalUserRepositoryMock
            .Setup(x => x.GetByEmailAsync("test@example.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(globalUser);

        _passwordHasherMock
            .Setup(x => x.VerifyPassword("wrong-password", "correct-hash"))
            .Returns(false);

        var command = new PasswordLoginCommand
        {
            TenantId = Guid.NewGuid(),
            Email = "test@example.com",
            Password = "wrong-password"
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("INVALID_CREDENTIALS");
    }

    #endregion

    #region User Not In Tenant Tests

    [Fact]
    public async Task Handle_UserNotInTenant_ReturnsUserNotInTenant()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var globalUserId = Guid.NewGuid();

        var globalUser = new GlobalUser
        {
            Id = globalUserId,
            Email = "test@example.com",
            PasswordHash = "hash"
        };

        _globalUserRepositoryMock
            .Setup(x => x.GetByEmailAsync("test@example.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(globalUser);

        _passwordHasherMock
            .Setup(x => x.VerifyPassword("password", "hash"))
            .Returns(true);

        _tenantUserRepositoryMock
            .Setup(x => x.GetByGlobalUserIdAndTenantIdAsync(globalUserId, tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TenantUser?)null);

        var command = new PasswordLoginCommand
        {
            TenantId = tenantId,
            Email = "test@example.com",
            Password = "password"
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("USER_NOT_IN_TENANT");
    }

    #endregion

    #region Inactive User Tests

    [Fact]
    public async Task Handle_DisabledUser_ReturnsUserInactive()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var globalUserId = Guid.NewGuid();

        var globalUser = new GlobalUser
        {
            Id = globalUserId,
            Email = "test@example.com",
            PasswordHash = "hash"
        };

        var tenantUser = new TenantUser
        {
            Id = Guid.NewGuid(),
            GlobalUserId = globalUserId,
            TenantId = tenantId,
            Status = TenantUserStatus.Disabled
        };

        _globalUserRepositoryMock
            .Setup(x => x.GetByEmailAsync("test@example.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(globalUser);

        _passwordHasherMock
            .Setup(x => x.VerifyPassword("password", "hash"))
            .Returns(true);

        _tenantUserRepositoryMock
            .Setup(x => x.GetByGlobalUserIdAndTenantIdAsync(globalUserId, tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenantUser);

        var command = new PasswordLoginCommand
        {
            TenantId = tenantId,
            Email = "test@example.com",
            Password = "password"
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("USER_INACTIVE");
    }

    [Fact]
    public async Task Handle_SuspendedUser_ReturnsUserInactive()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var globalUserId = Guid.NewGuid();

        var globalUser = new GlobalUser
        {
            Id = globalUserId,
            Email = "test@example.com",
            PasswordHash = "hash"
        };

        var tenantUser = new TenantUser
        {
            Id = Guid.NewGuid(),
            GlobalUserId = globalUserId,
            TenantId = tenantId,
            Status = TenantUserStatus.Suspended
        };

        _globalUserRepositoryMock
            .Setup(x => x.GetByEmailAsync("test@example.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(globalUser);

        _passwordHasherMock
            .Setup(x => x.VerifyPassword("password", "hash"))
            .Returns(true);

        _tenantUserRepositoryMock
            .Setup(x => x.GetByGlobalUserIdAndTenantIdAsync(globalUserId, tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenantUser);

        var command = new PasswordLoginCommand
        {
            TenantId = tenantId,
            Email = "test@example.com",
            Password = "password"
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("USER_INACTIVE");
    }

    [Fact]
    public async Task Handle_InvitedUser_ReturnsUserInactive()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var globalUserId = Guid.NewGuid();

        var globalUser = new GlobalUser
        {
            Id = globalUserId,
            Email = "test@example.com",
            PasswordHash = "hash"
        };

        var tenantUser = new TenantUser
        {
            Id = Guid.NewGuid(),
            GlobalUserId = globalUserId,
            TenantId = tenantId,
            Status = TenantUserStatus.Invited
        };

        _globalUserRepositoryMock
            .Setup(x => x.GetByEmailAsync("test@example.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(globalUser);

        _passwordHasherMock
            .Setup(x => x.VerifyPassword("password", "hash"))
            .Returns(true);

        _tenantUserRepositoryMock
            .Setup(x => x.GetByGlobalUserIdAndTenantIdAsync(globalUserId, tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenantUser);

        var command = new PasswordLoginCommand
        {
            TenantId = tenantId,
            Email = "test@example.com",
            Password = "password"
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("USER_INACTIVE");
    }

    #endregion

    #region MFA Tests

    [Fact]
    public async Task Handle_MfaRequired_ReturnsMfaChallenge()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var globalUserId = Guid.NewGuid();
        var tenantUserId = Guid.NewGuid();
        var challengeId = Guid.NewGuid();

        var globalUser = new GlobalUser
        {
            Id = globalUserId,
            Email = "test@example.com",
            PasswordHash = "hash"
        };

        var tenantUser = new TenantUser
        {
            Id = tenantUserId,
            GlobalUserId = globalUserId,
            TenantId = tenantId,
            Status = TenantUserStatus.Active,
            IsAdmin = true
        };

        _globalUserRepositoryMock
            .Setup(x => x.GetByEmailAsync("test@example.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(globalUser);

        _passwordHasherMock
            .Setup(x => x.VerifyPassword("password", "hash"))
            .Returns(true);

        _tenantUserRepositoryMock
            .Setup(x => x.GetByGlobalUserIdAndTenantIdAsync(globalUserId, tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenantUser);

        // MFA is required
        _mediatorMock
            .Setup(x => x.Send(It.IsAny<CheckMfaRequirementQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // MFA challenge response
        _mediatorMock
            .Setup(x => x.Send(It.IsAny<CreateMfaChallengeCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Onesign.Modules.Security.Application.DTOs.MfaChallengeDto
            {
                ChallengeId = challengeId,
                MethodType = 1,
                MaskedDestination = "***@example.com"
            });

        var command = new PasswordLoginCommand
        {
            TenantId = tenantId,
            Email = "test@example.com",
            Password = "password"
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.MfaRequired.Should().BeTrue();
        result.Value.ChallengeId.Should().Be(challengeId);
        result.Value.AccessToken.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_MfaRequiredWithTrustedDevice_BypassesMfa()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var globalUserId = Guid.NewGuid();
        var tenantUserId = Guid.NewGuid();

        var globalUser = new GlobalUser
        {
            Id = globalUserId,
            Email = "test@example.com",
            PasswordHash = "hash"
        };

        var tenantUser = new TenantUser
        {
            Id = tenantUserId,
            GlobalUserId = globalUserId,
            TenantId = tenantId,
            Status = TenantUserStatus.Active
        };

        SetupSuccessfulLogin(globalUser, tenantUser, "password");

        // MFA is required
        _mediatorMock
            .Setup(x => x.Send(It.IsAny<CheckMfaRequirementQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Device is trusted
        _mediatorMock
            .Setup(x => x.Send(It.IsAny<CheckTrustedDeviceQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var command = new PasswordLoginCommand
        {
            TenantId = tenantId,
            Email = "test@example.com",
            Password = "password",
            DeviceFingerprint = "trusted-device-fingerprint"
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.MfaRequired.Should().BeFalse();
        result.Value.AccessToken.Should().NotBeEmpty();
    }

    #endregion

    #region ClientId Tests

    [Fact]
    public async Task Handle_WithClientId_PassesClientIdToTokenGeneration()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var clientId = Guid.NewGuid();
        var globalUserId = Guid.NewGuid();
        var tenantUserId = Guid.NewGuid();

        var globalUser = new GlobalUser
        {
            Id = globalUserId,
            Email = "test@example.com",
            PasswordHash = "hash"
        };

        var tenantUser = new TenantUser
        {
            Id = tenantUserId,
            GlobalUserId = globalUserId,
            TenantId = tenantId,
            Status = TenantUserStatus.Active
        };

        SetupSuccessfulLogin(globalUser, tenantUser, "password");

        var command = new PasswordLoginCommand
        {
            TenantId = tenantId,
            Email = "test@example.com",
            Password = "password",
            ClientId = clientId
        };

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _authServiceMock.Verify(x => x.GenerateAccessTokenAsync(
            tenantUserId, tenantId, clientId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WithoutClientId_UsesEmptyGuid()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var globalUserId = Guid.NewGuid();
        var tenantUserId = Guid.NewGuid();

        var globalUser = new GlobalUser
        {
            Id = globalUserId,
            Email = "test@example.com",
            PasswordHash = "hash"
        };

        var tenantUser = new TenantUser
        {
            Id = tenantUserId,
            GlobalUserId = globalUserId,
            TenantId = tenantId,
            Status = TenantUserStatus.Active
        };

        SetupSuccessfulLogin(globalUser, tenantUser, "password");

        var command = new PasswordLoginCommand
        {
            TenantId = tenantId,
            Email = "test@example.com",
            Password = "password",
            ClientId = null
        };

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _authServiceMock.Verify(x => x.GenerateAccessTokenAsync(
            tenantUserId, tenantId, Guid.Empty, It.IsAny<CancellationToken>()), Times.Once);
    }

    #endregion

    #region Helper Methods

    private void SetupSuccessfulLogin(GlobalUser globalUser, TenantUser tenantUser, string password)
    {
        _globalUserRepositoryMock
            .Setup(x => x.GetByEmailAsync(globalUser.Email, It.IsAny<CancellationToken>()))
            .ReturnsAsync(globalUser);

        _passwordHasherMock
            .Setup(x => x.VerifyPassword(password, globalUser.PasswordHash!))
            .Returns(true);

        _tenantUserRepositoryMock
            .Setup(x => x.GetByGlobalUserIdAndTenantIdAsync(globalUser.Id, tenantUser.TenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenantUser);

        _tenantUserRepositoryMock
            .Setup(x => x.UpdateAsync(It.IsAny<TenantUser>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<CheckMfaRequirementQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        _authServiceMock
            .Setup(x => x.GenerateAccessTokenAsync(It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync("access-token");

        _authServiceMock
            .Setup(x => x.GenerateIdTokenAsync(It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync("id-token");

        _userLoginSessionRepositoryMock
            .Setup(x => x.AddAsync(It.IsAny<UserLoginSession>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((UserLoginSession session, CancellationToken _) => session);

        _mediatorMock
            .Setup(x => x.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(new Onesign.Modules.Audit.Application.DTOs.AuditEventDto()));
    }

    #endregion
}
