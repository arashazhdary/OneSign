using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Moq;
using Moq.Protected;
using Onesign.Modules.Identity.Application.Commands;
using Onesign.Modules.Identity.Domain.Entities;
using Onesign.Modules.Identity.Domain.Enums;
using Onesign.Modules.Identity.Domain.Repositories;
using Onesign.Modules.Identity.Domain.Services;
using System.Net;
using System.Text.Json;
using Xunit;

namespace Onesign.Api.Tests.Identity;

public class GoogleLoginCommandHandlerTests
{
    private readonly Mock<IGlobalUserRepository> _globalUserRepositoryMock;
    private readonly Mock<ITenantUserRepository> _tenantUserRepositoryMock;
    private readonly Mock<IExternalLoginRepository> _externalLoginRepositoryMock;
    private readonly Mock<IUserLoginSessionRepository> _userLoginSessionRepositoryMock;
    private readonly Mock<IAuthService> _authServiceMock;
    private readonly Mock<IConfiguration> _configurationMock;
    private readonly Mock<HttpMessageHandler> _httpMessageHandlerMock;
    private readonly HttpClient _httpClient;

    public GoogleLoginCommandHandlerTests()
    {
        _globalUserRepositoryMock = new Mock<IGlobalUserRepository>();
        _tenantUserRepositoryMock = new Mock<ITenantUserRepository>();
        _externalLoginRepositoryMock = new Mock<IExternalLoginRepository>();
        _userLoginSessionRepositoryMock = new Mock<IUserLoginSessionRepository>();
        _authServiceMock = new Mock<IAuthService>();
        _configurationMock = new Mock<IConfiguration>();
        _httpMessageHandlerMock = new Mock<HttpMessageHandler>();
        _httpClient = new HttpClient(_httpMessageHandlerMock.Object);
    }

    private GoogleLoginCommandHandler CreateHandler()
    {
        return new GoogleLoginCommandHandler(
            _globalUserRepositoryMock.Object,
            _tenantUserRepositoryMock.Object,
            _externalLoginRepositoryMock.Object,
            _userLoginSessionRepositoryMock.Object,
            _authServiceMock.Object,
            _httpClient,
            _configurationMock.Object);
    }

    #region Configuration Tests

    [Fact]
    public async Task Handle_GoogleNotConfigured_ReturnsFailure()
    {
        // Arrange
        _configurationMock.Setup(x => x["Google:ClientId"]).Returns((string?)null);

        var handler = CreateHandler();
        var command = new GoogleLoginCommand
        {
            TenantId = Guid.NewGuid(),
            IdToken = "test-token"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("GOOGLE_NOT_CONFIGURED");
    }

    [Fact]
    public async Task Handle_EmptyGoogleClientId_ReturnsFailure()
    {
        // Arrange
        _configurationMock.Setup(x => x["Google:ClientId"]).Returns("");

        var handler = CreateHandler();
        var command = new GoogleLoginCommand
        {
            TenantId = Guid.NewGuid(),
            IdToken = "test-token"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("GOOGLE_NOT_CONFIGURED");
    }

    #endregion

    #region Token Validation Tests

    [Fact]
    public async Task Handle_InvalidGoogleToken_ReturnsFailure()
    {
        // Arrange
        SetupGoogleClientId();
        SetupHttpResponse(HttpStatusCode.BadRequest, "{}");

        var handler = CreateHandler();
        var command = new GoogleLoginCommand
        {
            TenantId = Guid.NewGuid(),
            IdToken = "invalid-token"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("INVALID_GOOGLE_TOKEN");
    }

    [Fact]
    public async Task Handle_AudienceMismatch_ReturnsFailure()
    {
        // Arrange
        SetupGoogleClientId("correct-client-id");

        var tokenInfo = new
        {
            aud = "wrong-client-id",
            sub = "google-user-id",
            email = "test@example.com",
            email_verified = true
        };
        SetupHttpResponse(HttpStatusCode.OK, JsonSerializer.Serialize(tokenInfo));

        var handler = CreateHandler();
        var command = new GoogleLoginCommand
        {
            TenantId = Guid.NewGuid(),
            IdToken = "test-token"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("INVALID_GOOGLE_TOKEN");
    }

    [Fact]
    public async Task Handle_MissingEmail_ReturnsFailure()
    {
        // Arrange
        SetupGoogleClientId();

        var tokenInfo = new
        {
            aud = "test-client-id",
            sub = "google-user-id",
            email = "",
            email_verified = true
        };
        SetupHttpResponse(HttpStatusCode.OK, JsonSerializer.Serialize(tokenInfo));

        var handler = CreateHandler();
        var command = new GoogleLoginCommand
        {
            TenantId = Guid.NewGuid(),
            IdToken = "test-token"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("GOOGLE_EMAIL_MISSING");
    }

    [Fact]
    public async Task Handle_MissingUserId_ReturnsFailure()
    {
        // Arrange
        SetupGoogleClientId();

        var tokenInfo = new
        {
            aud = "test-client-id",
            sub = "",
            email = "test@example.com",
            email_verified = true
        };
        SetupHttpResponse(HttpStatusCode.OK, JsonSerializer.Serialize(tokenInfo));

        var handler = CreateHandler();
        var command = new GoogleLoginCommand
        {
            TenantId = Guid.NewGuid(),
            IdToken = "test-token"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("INVALID_TOKEN");
    }

    #endregion

    #region New User Tests

    [Fact]
    public async Task Handle_NewUser_CreatesGlobalUser()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        SetupGoogleClientId();
        SetupValidGoogleTokenResponse("test@example.com", "google-user-id");

        _globalUserRepositoryMock
            .Setup(x => x.GetByEmailAsync("test@example.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync((GlobalUser?)null);

        GlobalUser? createdUser = null;
        _globalUserRepositoryMock
            .Setup(x => x.AddAsync(It.IsAny<GlobalUser>(), It.IsAny<CancellationToken>()))
            .Callback<GlobalUser, CancellationToken>((user, _) => createdUser = user)
            .ReturnsAsync((GlobalUser user, CancellationToken _) => user);

        SetupExternalLoginAndTenantUserCreation();
        SetupTokenGeneration();

        var handler = CreateHandler();
        var command = new GoogleLoginCommand
        {
            TenantId = tenantId,
            IdToken = "test-token"
        };

        // Act
        await handler.Handle(command, CancellationToken.None);

        // Assert
        createdUser.Should().NotBeNull();
        createdUser!.Email.Should().Be("test@example.com");
        createdUser.EmailVerified.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_NewUser_CreatesExternalLogin()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var googleUserId = "google-user-123";
        SetupGoogleClientId();
        SetupValidGoogleTokenResponse("test@example.com", googleUserId);

        var globalUser = new GlobalUser
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com"
        };

        _globalUserRepositoryMock
            .Setup(x => x.GetByEmailAsync("test@example.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync((GlobalUser?)null);

        _globalUserRepositoryMock
            .Setup(x => x.AddAsync(It.IsAny<GlobalUser>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(globalUser);

        _externalLoginRepositoryMock
            .Setup(x => x.GetByProviderAndProviderUserIdAsync("Google", googleUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((ExternalLogin?)null);

        ExternalLogin? createdExternalLogin = null;
        _externalLoginRepositoryMock
            .Setup(x => x.AddAsync(It.IsAny<ExternalLogin>(), It.IsAny<CancellationToken>()))
            .Callback<ExternalLogin, CancellationToken>((login, _) => createdExternalLogin = login)
            .ReturnsAsync((ExternalLogin login, CancellationToken _) => login);

        _tenantUserRepositoryMock
            .Setup(x => x.GetByGlobalUserIdAndTenantIdAsync(It.IsAny<Guid>(), tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TenantUser?)null);

        _tenantUserRepositoryMock
            .Setup(x => x.AddAsync(It.IsAny<TenantUser>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((TenantUser user, CancellationToken _) => user);

        SetupTokenGeneration();

        var handler = CreateHandler();
        var command = new GoogleLoginCommand
        {
            TenantId = tenantId,
            IdToken = "test-token"
        };

        // Act
        await handler.Handle(command, CancellationToken.None);

        // Assert
        createdExternalLogin.Should().NotBeNull();
        createdExternalLogin!.Provider.Should().Be("Google");
        createdExternalLogin.ProviderUserId.Should().Be(googleUserId);
    }

    [Fact]
    public async Task Handle_NewUser_CreatesTenantUser()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        SetupGoogleClientId();
        SetupValidGoogleTokenResponse("test@example.com", "google-user-id");

        var globalUser = new GlobalUser
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com"
        };

        _globalUserRepositoryMock
            .Setup(x => x.GetByEmailAsync("test@example.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync((GlobalUser?)null);

        _globalUserRepositoryMock
            .Setup(x => x.AddAsync(It.IsAny<GlobalUser>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(globalUser);

        SetupExternalLoginCreation();

        _tenantUserRepositoryMock
            .Setup(x => x.GetByGlobalUserIdAndTenantIdAsync(It.IsAny<Guid>(), tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TenantUser?)null);

        TenantUser? createdTenantUser = null;
        _tenantUserRepositoryMock
            .Setup(x => x.AddAsync(It.IsAny<TenantUser>(), It.IsAny<CancellationToken>()))
            .Callback<TenantUser, CancellationToken>((user, _) => createdTenantUser = user)
            .ReturnsAsync((TenantUser user, CancellationToken _) => user);

        SetupTokenGeneration();

        var handler = CreateHandler();
        var command = new GoogleLoginCommand
        {
            TenantId = tenantId,
            IdToken = "test-token"
        };

        // Act
        await handler.Handle(command, CancellationToken.None);

        // Assert
        createdTenantUser.Should().NotBeNull();
        createdTenantUser!.TenantId.Should().Be(tenantId);
        createdTenantUser.Status.Should().Be(TenantUserStatus.Active);
        createdTenantUser.IsAdmin.Should().BeFalse();
    }

    #endregion

    #region Existing User Tests

    [Fact]
    public async Task Handle_ExistingUser_UpdatesEmailVerified()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        SetupGoogleClientId();
        SetupValidGoogleTokenResponse("test@example.com", "google-user-id", emailVerified: true);

        var globalUser = new GlobalUser
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            EmailVerified = false
        };

        _globalUserRepositoryMock
            .Setup(x => x.GetByEmailAsync("test@example.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(globalUser);

        GlobalUser? updatedUser = null;
        _globalUserRepositoryMock
            .Setup(x => x.UpdateAsync(It.IsAny<GlobalUser>(), It.IsAny<CancellationToken>()))
            .Callback<GlobalUser, CancellationToken>((user, _) => updatedUser = user)
            .Returns(Task.CompletedTask);

        SetupExternalLoginCreation();
        SetupTenantUserForExistingUser(tenantId, globalUser.Id);
        SetupTokenGeneration();

        var handler = CreateHandler();
        var command = new GoogleLoginCommand
        {
            TenantId = tenantId,
            IdToken = "test-token"
        };

        // Act
        await handler.Handle(command, CancellationToken.None);

        // Assert
        updatedUser.Should().NotBeNull();
        updatedUser!.EmailVerified.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_ExistingUserAlreadyVerified_DoesNotUpdate()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        SetupGoogleClientId();
        SetupValidGoogleTokenResponse("test@example.com", "google-user-id", emailVerified: true);

        var globalUser = new GlobalUser
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            EmailVerified = true // Already verified
        };

        _globalUserRepositoryMock
            .Setup(x => x.GetByEmailAsync("test@example.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(globalUser);

        SetupExternalLoginCreation();
        SetupTenantUserForExistingUser(tenantId, globalUser.Id);
        SetupTokenGeneration();

        var handler = CreateHandler();
        var command = new GoogleLoginCommand
        {
            TenantId = tenantId,
            IdToken = "test-token"
        };

        // Act
        await handler.Handle(command, CancellationToken.None);

        // Assert
        _globalUserRepositoryMock.Verify(x => x.UpdateAsync(
            It.IsAny<GlobalUser>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Handle_InactiveTenantUser_ReturnsFailure()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        SetupGoogleClientId();
        SetupValidGoogleTokenResponse("test@example.com", "google-user-id");

        var globalUser = new GlobalUser
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com"
        };

        var tenantUser = new TenantUser
        {
            Id = Guid.NewGuid(),
            GlobalUserId = globalUser.Id,
            TenantId = tenantId,
            Status = TenantUserStatus.Disabled
        };

        _globalUserRepositoryMock
            .Setup(x => x.GetByEmailAsync("test@example.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(globalUser);

        SetupExternalLoginCreation();

        _tenantUserRepositoryMock
            .Setup(x => x.GetByGlobalUserIdAndTenantIdAsync(globalUser.Id, tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenantUser);

        var handler = CreateHandler();
        var command = new GoogleLoginCommand
        {
            TenantId = tenantId,
            IdToken = "test-token"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("USER_INACTIVE");
    }

    #endregion

    #region Successful Login Tests

    [Fact]
    public async Task Handle_SuccessfulLogin_ReturnsTokens()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        SetupGoogleClientId();
        SetupValidGoogleTokenResponse("test@example.com", "google-user-id");

        var globalUser = new GlobalUser
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com"
        };

        _globalUserRepositoryMock
            .Setup(x => x.GetByEmailAsync("test@example.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(globalUser);

        SetupExternalLoginCreation();
        SetupTenantUserForExistingUser(tenantId, globalUser.Id);

        _authServiceMock
            .Setup(x => x.GenerateAccessTokenAsync(It.IsAny<Guid>(), tenantId, It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync("access-token");

        _authServiceMock
            .Setup(x => x.GenerateIdTokenAsync(It.IsAny<Guid>(), tenantId, It.IsAny<Guid>(), "test@example.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync("id-token");

        _userLoginSessionRepositoryMock
            .Setup(x => x.AddAsync(It.IsAny<UserLoginSession>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((UserLoginSession session, CancellationToken _) => session);

        var handler = CreateHandler();
        var command = new GoogleLoginCommand
        {
            TenantId = tenantId,
            IdToken = "test-token"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.AccessToken.Should().Be("access-token");
        result.Value.IdToken.Should().Be("id-token");
        result.Value.TokenType.Should().Be("Bearer");
        result.Value.ExpiresIn.Should().Be(3600);
    }

    [Fact]
    public async Task Handle_SuccessfulLogin_CreatesLoginSession()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        SetupGoogleClientId();
        SetupValidGoogleTokenResponse("test@example.com", "google-user-id");

        var globalUser = new GlobalUser
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com"
        };

        _globalUserRepositoryMock
            .Setup(x => x.GetByEmailAsync("test@example.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(globalUser);

        SetupExternalLoginCreation();
        SetupTenantUserForExistingUser(tenantId, globalUser.Id);
        SetupTokenGeneration();

        UserLoginSession? createdSession = null;
        _userLoginSessionRepositoryMock
            .Setup(x => x.AddAsync(It.IsAny<UserLoginSession>(), It.IsAny<CancellationToken>()))
            .Callback<UserLoginSession, CancellationToken>((session, _) => createdSession = session)
            .ReturnsAsync((UserLoginSession session, CancellationToken _) => session);

        var handler = CreateHandler();
        var command = new GoogleLoginCommand
        {
            TenantId = tenantId,
            IdToken = "test-token"
        };

        // Act
        await handler.Handle(command, CancellationToken.None);

        // Assert
        createdSession.Should().NotBeNull();
        createdSession!.SessionToken.Should().NotBeNullOrEmpty();
        createdSession.ExpiresAt.Should().BeCloseTo(DateTime.UtcNow.AddHours(24), TimeSpan.FromSeconds(5));
    }

    [Fact]
    public async Task Handle_SuccessfulLogin_UpdatesLastLoginAt()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        SetupGoogleClientId();
        SetupValidGoogleTokenResponse("test@example.com", "google-user-id");

        var globalUser = new GlobalUser
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com"
        };

        var tenantUser = new TenantUser
        {
            Id = Guid.NewGuid(),
            GlobalUserId = globalUser.Id,
            TenantId = tenantId,
            Status = TenantUserStatus.Active
        };

        _globalUserRepositoryMock
            .Setup(x => x.GetByEmailAsync("test@example.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(globalUser);

        SetupExternalLoginCreation();

        _tenantUserRepositoryMock
            .Setup(x => x.GetByGlobalUserIdAndTenantIdAsync(globalUser.Id, tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenantUser);

        TenantUser? updatedTenantUser = null;
        _tenantUserRepositoryMock
            .Setup(x => x.UpdateAsync(It.IsAny<TenantUser>(), It.IsAny<CancellationToken>()))
            .Callback<TenantUser, CancellationToken>((user, _) => updatedTenantUser = user)
            .Returns(Task.CompletedTask);

        SetupTokenGeneration();

        var handler = CreateHandler();
        var command = new GoogleLoginCommand
        {
            TenantId = tenantId,
            IdToken = "test-token"
        };

        // Act
        await handler.Handle(command, CancellationToken.None);

        // Assert
        updatedTenantUser.Should().NotBeNull();
        updatedTenantUser!.LastLoginAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    #endregion

    #region Helper Methods

    private void SetupGoogleClientId(string clientId = "test-client-id")
    {
        _configurationMock.Setup(x => x["Google:ClientId"]).Returns(clientId);
    }

    private void SetupHttpResponse(HttpStatusCode statusCode, string content)
    {
        _httpMessageHandlerMock
            .Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(new HttpResponseMessage
            {
                StatusCode = statusCode,
                Content = new StringContent(content)
            });
    }

    private void SetupValidGoogleTokenResponse(string email, string sub, bool emailVerified = true)
    {
        var tokenInfo = new
        {
            aud = "test-client-id",
            sub = sub,
            email = email,
            email_verified = emailVerified
        };
        SetupHttpResponse(HttpStatusCode.OK, JsonSerializer.Serialize(tokenInfo));
    }

    private void SetupExternalLoginCreation()
    {
        _externalLoginRepositoryMock
            .Setup(x => x.GetByProviderAndProviderUserIdAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((ExternalLogin?)null);

        _externalLoginRepositoryMock
            .Setup(x => x.AddAsync(It.IsAny<ExternalLogin>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((ExternalLogin login, CancellationToken _) => login);
    }

    private void SetupExternalLoginAndTenantUserCreation()
    {
        SetupExternalLoginCreation();

        _tenantUserRepositoryMock
            .Setup(x => x.GetByGlobalUserIdAndTenantIdAsync(It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((TenantUser?)null);

        _tenantUserRepositoryMock
            .Setup(x => x.AddAsync(It.IsAny<TenantUser>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((TenantUser user, CancellationToken _) => user);

        _userLoginSessionRepositoryMock
            .Setup(x => x.AddAsync(It.IsAny<UserLoginSession>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((UserLoginSession session, CancellationToken _) => session);
    }

    private void SetupTenantUserForExistingUser(Guid tenantId, Guid globalUserId)
    {
        var tenantUser = new TenantUser
        {
            Id = Guid.NewGuid(),
            GlobalUserId = globalUserId,
            TenantId = tenantId,
            Status = TenantUserStatus.Active
        };

        _tenantUserRepositoryMock
            .Setup(x => x.GetByGlobalUserIdAndTenantIdAsync(globalUserId, tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenantUser);

        _tenantUserRepositoryMock
            .Setup(x => x.UpdateAsync(It.IsAny<TenantUser>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        _userLoginSessionRepositoryMock
            .Setup(x => x.AddAsync(It.IsAny<UserLoginSession>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((UserLoginSession session, CancellationToken _) => session);
    }

    private void SetupTokenGeneration()
    {
        _authServiceMock
            .Setup(x => x.GenerateAccessTokenAsync(It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync("access-token");

        _authServiceMock
            .Setup(x => x.GenerateIdTokenAsync(It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<string?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync("id-token");
    }

    #endregion
}
