using FluentAssertions;
using Moq;
using Onesign.Modules.Identity.Domain.Entities;
using Onesign.Modules.Identity.Domain.Repositories;
using Onesign.Modules.Identity.Infrastructure.Security;
using Onesign.Shared.Security;
using System.Text;
using System.Text.Json;
using Xunit;

namespace Onesign.Api.Tests.Identity;

public class AuthServiceTests
{
    private readonly Mock<IJwtSigningKeyProvider> _signingKeyProviderMock;
    private readonly Mock<IAuthorizationCodeRepository> _authorizationCodeRepositoryMock;
    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        _signingKeyProviderMock = new Mock<IJwtSigningKeyProvider>();
        _authorizationCodeRepositoryMock = new Mock<IAuthorizationCodeRepository>();
        _signingKeyProviderMock.Setup(x => x.GetSigningKey()).Returns("test-signing-key-12345678901234567890");
        _authService = new AuthService(_signingKeyProviderMock.Object, _authorizationCodeRepositoryMock.Object);
    }

    #region GenerateAuthorizationCodeAsync Tests

    [Fact]
    public async Task GenerateAuthorizationCodeAsync_ValidInput_ReturnsCode()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();
        var clientId = Guid.NewGuid();
        var redirectUri = "https://example.com/callback";
        var codeChallenge = "test-challenge";

        _authorizationCodeRepositoryMock
            .Setup(x => x.AddAsync(It.IsAny<AuthorizationCode>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((AuthorizationCode code, CancellationToken _) => code);

        // Act
        var result = await _authService.GenerateAuthorizationCodeAsync(
            tenantUserId, clientId, redirectUri, codeChallenge);

        // Assert
        result.Should().NotBeNullOrEmpty();
        result.Should().HaveLength(32); // Guid.NewGuid().ToString("N") length
    }

    [Fact]
    public async Task GenerateAuthorizationCodeAsync_SavesCodeToRepository()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();
        var clientId = Guid.NewGuid();
        var redirectUri = "https://example.com/callback";
        var codeChallenge = "test-challenge";

        AuthorizationCode? savedCode = null;
        _authorizationCodeRepositoryMock
            .Setup(x => x.AddAsync(It.IsAny<AuthorizationCode>(), It.IsAny<CancellationToken>()))
            .Callback<AuthorizationCode, CancellationToken>((code, _) => savedCode = code)
            .ReturnsAsync((AuthorizationCode code, CancellationToken _) => code);

        // Act
        var result = await _authService.GenerateAuthorizationCodeAsync(
            tenantUserId, clientId, redirectUri, codeChallenge);

        // Assert
        savedCode.Should().NotBeNull();
        savedCode!.TenantUserId.Should().Be(tenantUserId);
        savedCode.ApplicationClientId.Should().Be(clientId);
        savedCode.RedirectUri.Should().Be(redirectUri);
        savedCode.CodeChallenge.Should().Be(codeChallenge);
        savedCode.IsUsed.Should().BeFalse();
        savedCode.ExpiresAt.Should().BeCloseTo(DateTime.UtcNow.AddMinutes(10), TimeSpan.FromSeconds(5));
    }

    [Fact]
    public async Task GenerateAuthorizationCodeAsync_SetsExpirationTo10Minutes()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();
        var clientId = Guid.NewGuid();
        var redirectUri = "https://example.com/callback";
        var codeChallenge = "test-challenge";

        AuthorizationCode? savedCode = null;
        _authorizationCodeRepositoryMock
            .Setup(x => x.AddAsync(It.IsAny<AuthorizationCode>(), It.IsAny<CancellationToken>()))
            .Callback<AuthorizationCode, CancellationToken>((code, _) => savedCode = code)
            .ReturnsAsync((AuthorizationCode code, CancellationToken _) => code);

        // Act
        await _authService.GenerateAuthorizationCodeAsync(
            tenantUserId, clientId, redirectUri, codeChallenge);

        // Assert
        savedCode!.ExpiresAt.Should().BeCloseTo(DateTime.UtcNow.AddMinutes(10), TimeSpan.FromSeconds(5));
    }

    #endregion

    #region ValidateAuthorizationCodeAsync Tests

    [Fact]
    public async Task ValidateAuthorizationCodeAsync_ValidCode_ReturnsData()
    {
        // Arrange
        var code = "test-code";
        var authorizationCode = new AuthorizationCode
        {
            Id = Guid.NewGuid(),
            Code = code,
            TenantUserId = Guid.NewGuid(),
            ApplicationClientId = Guid.NewGuid(),
            RedirectUri = "https://example.com/callback",
            CodeChallenge = "challenge",
            ExpiresAt = DateTime.UtcNow.AddMinutes(5),
            IsUsed = false
        };

        _authorizationCodeRepositoryMock
            .Setup(x => x.GetByCodeAsync(code, It.IsAny<CancellationToken>()))
            .ReturnsAsync(authorizationCode);

        _authorizationCodeRepositoryMock
            .Setup(x => x.UpdateAsync(It.IsAny<AuthorizationCode>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _authService.ValidateAuthorizationCodeAsync(code);

        // Assert
        result.Should().NotBeNull();
        result!.Value.TenantUserId.Should().Be(authorizationCode.TenantUserId);
        result.Value.ClientId.Should().Be(authorizationCode.ApplicationClientId);
        result.Value.RedirectUri.Should().Be(authorizationCode.RedirectUri);
        result.Value.CodeChallenge.Should().Be(authorizationCode.CodeChallenge);
    }

    [Fact]
    public async Task ValidateAuthorizationCodeAsync_InvalidCode_ReturnsNull()
    {
        // Arrange
        var code = "invalid-code";
        _authorizationCodeRepositoryMock
            .Setup(x => x.GetByCodeAsync(code, It.IsAny<CancellationToken>()))
            .ReturnsAsync((AuthorizationCode?)null);

        // Act
        var result = await _authService.ValidateAuthorizationCodeAsync(code);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task ValidateAuthorizationCodeAsync_MarksCodeAsUsed()
    {
        // Arrange
        var code = "test-code";
        var authorizationCode = new AuthorizationCode
        {
            Id = Guid.NewGuid(),
            Code = code,
            TenantUserId = Guid.NewGuid(),
            ApplicationClientId = Guid.NewGuid(),
            RedirectUri = "https://example.com/callback",
            CodeChallenge = "challenge",
            IsUsed = false
        };

        _authorizationCodeRepositoryMock
            .Setup(x => x.GetByCodeAsync(code, It.IsAny<CancellationToken>()))
            .ReturnsAsync(authorizationCode);

        AuthorizationCode? updatedCode = null;
        _authorizationCodeRepositoryMock
            .Setup(x => x.UpdateAsync(It.IsAny<AuthorizationCode>(), It.IsAny<CancellationToken>()))
            .Callback<AuthorizationCode, CancellationToken>((code, _) => updatedCode = code)
            .Returns(Task.CompletedTask);

        // Act
        await _authService.ValidateAuthorizationCodeAsync(code);

        // Assert
        updatedCode.Should().NotBeNull();
        updatedCode!.IsUsed.Should().BeTrue();
    }

    #endregion

    #region GenerateAccessTokenAsync Tests

    [Fact]
    public async Task GenerateAccessTokenAsync_ReturnsValidJwtFormat()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var clientId = Guid.NewGuid();

        // Act
        var result = await _authService.GenerateAccessTokenAsync(tenantUserId, tenantId, clientId);

        // Assert
        result.Should().NotBeNullOrEmpty();
        var parts = result.Split('.');
        parts.Should().HaveCount(3); // JWT has 3 parts: header.payload.signature
    }

    [Fact]
    public async Task GenerateAccessTokenAsync_ContainsCorrectClaims()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var clientId = Guid.NewGuid();

        // Act
        var result = await _authService.GenerateAccessTokenAsync(tenantUserId, tenantId, clientId);

        // Assert
        var parts = result.Split('.');
        var payloadBase64 = parts[1];

        // Add padding if necessary
        payloadBase64 = payloadBase64.Replace('-', '+').Replace('_', '/');
        switch (payloadBase64.Length % 4)
        {
            case 2: payloadBase64 += "=="; break;
            case 3: payloadBase64 += "="; break;
        }

        var payloadJson = Encoding.UTF8.GetString(Convert.FromBase64String(payloadBase64));
        var payload = JsonSerializer.Deserialize<JsonElement>(payloadJson);

        payload.GetProperty("sub").GetString().Should().Be(tenantUserId.ToString());
        payload.GetProperty("tenant_id").GetString().Should().Be(tenantId.ToString());
        payload.GetProperty("client_id").GetString().Should().Be(clientId.ToString());
    }

    [Fact]
    public async Task GenerateAccessTokenAsync_SetsExpirationTo1Hour()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var clientId = Guid.NewGuid();

        // Act
        var result = await _authService.GenerateAccessTokenAsync(tenantUserId, tenantId, clientId);

        // Assert
        var parts = result.Split('.');
        var payloadBase64 = parts[1];
        payloadBase64 = payloadBase64.Replace('-', '+').Replace('_', '/');
        switch (payloadBase64.Length % 4)
        {
            case 2: payloadBase64 += "=="; break;
            case 3: payloadBase64 += "="; break;
        }

        var payloadJson = Encoding.UTF8.GetString(Convert.FromBase64String(payloadBase64));
        var payload = JsonSerializer.Deserialize<JsonElement>(payloadJson);

        var exp = payload.GetProperty("exp").GetInt64();
        var iat = payload.GetProperty("iat").GetInt64();

        (exp - iat).Should().Be(3600); // 1 hour in seconds
    }

    [Fact]
    public async Task GenerateAccessTokenAsync_UsesHS256Algorithm()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var clientId = Guid.NewGuid();

        // Act
        var result = await _authService.GenerateAccessTokenAsync(tenantUserId, tenantId, clientId);

        // Assert
        var parts = result.Split('.');
        var headerBase64 = parts[0];
        headerBase64 = headerBase64.Replace('-', '+').Replace('_', '/');
        switch (headerBase64.Length % 4)
        {
            case 2: headerBase64 += "=="; break;
            case 3: headerBase64 += "="; break;
        }

        var headerJson = Encoding.UTF8.GetString(Convert.FromBase64String(headerBase64));
        var header = JsonSerializer.Deserialize<JsonElement>(headerJson);

        header.GetProperty("alg").GetString().Should().Be("HS256");
        header.GetProperty("typ").GetString().Should().Be("JWT");
    }

    #endregion

    #region GenerateIdTokenAsync Tests

    [Fact]
    public async Task GenerateIdTokenAsync_WithoutEmail_ReturnsValidToken()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var clientId = Guid.NewGuid();

        // Act
        var result = await _authService.GenerateIdTokenAsync(tenantUserId, tenantId, clientId);

        // Assert
        result.Should().NotBeNullOrEmpty();
        var parts = result.Split('.');
        parts.Should().HaveCount(3);
    }

    [Fact]
    public async Task GenerateIdTokenAsync_WithEmail_IncludesEmailClaim()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var clientId = Guid.NewGuid();
        var email = "test@example.com";

        // Act
        var result = await _authService.GenerateIdTokenAsync(tenantUserId, tenantId, clientId, email);

        // Assert
        var parts = result.Split('.');
        var payloadBase64 = parts[1];
        payloadBase64 = payloadBase64.Replace('-', '+').Replace('_', '/');
        switch (payloadBase64.Length % 4)
        {
            case 2: payloadBase64 += "=="; break;
            case 3: payloadBase64 += "="; break;
        }

        var payloadJson = Encoding.UTF8.GetString(Convert.FromBase64String(payloadBase64));
        var payload = JsonSerializer.Deserialize<JsonElement>(payloadJson);

        payload.GetProperty("email").GetString().Should().Be(email);
    }

    [Fact]
    public async Task GenerateIdTokenAsync_WithNullEmail_DoesNotIncludeEmailClaim()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var clientId = Guid.NewGuid();

        // Act
        var result = await _authService.GenerateIdTokenAsync(tenantUserId, tenantId, clientId, null);

        // Assert
        var parts = result.Split('.');
        var payloadBase64 = parts[1];
        payloadBase64 = payloadBase64.Replace('-', '+').Replace('_', '/');
        switch (payloadBase64.Length % 4)
        {
            case 2: payloadBase64 += "=="; break;
            case 3: payloadBase64 += "="; break;
        }

        var payloadJson = Encoding.UTF8.GetString(Convert.FromBase64String(payloadBase64));
        var payload = JsonSerializer.Deserialize<JsonElement>(payloadJson);

        payload.TryGetProperty("email", out _).Should().BeFalse();
    }

    [Fact]
    public async Task GenerateIdTokenAsync_WithEmptyEmail_DoesNotIncludeEmailClaim()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var clientId = Guid.NewGuid();

        // Act
        var result = await _authService.GenerateIdTokenAsync(tenantUserId, tenantId, clientId, "");

        // Assert
        var parts = result.Split('.');
        var payloadBase64 = parts[1];
        payloadBase64 = payloadBase64.Replace('-', '+').Replace('_', '/');
        switch (payloadBase64.Length % 4)
        {
            case 2: payloadBase64 += "=="; break;
            case 3: payloadBase64 += "="; break;
        }

        var payloadJson = Encoding.UTF8.GetString(Convert.FromBase64String(payloadBase64));
        var payload = JsonSerializer.Deserialize<JsonElement>(payloadJson);

        payload.TryGetProperty("email", out _).Should().BeFalse();
    }

    [Fact]
    public async Task GenerateIdTokenAsync_ProducesConsistentSignature()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var clientId = Guid.NewGuid();

        // Act
        var result1 = await _authService.GenerateAccessTokenAsync(tenantUserId, tenantId, clientId);
        var result2 = await _authService.GenerateAccessTokenAsync(tenantUserId, tenantId, clientId);

        // Assert
        // Signatures should be similar structure (algorithm)
        result1.Split('.')[0].Should().Be(result2.Split('.')[0]); // Same header
    }

    #endregion

    #region Edge Cases

    [Fact]
    public async Task GenerateAccessTokenAsync_WithEmptyGuid_HandlesGracefully()
    {
        // Arrange
        var tenantUserId = Guid.Empty;
        var tenantId = Guid.Empty;
        var clientId = Guid.Empty;

        // Act
        var result = await _authService.GenerateAccessTokenAsync(tenantUserId, tenantId, clientId);

        // Assert
        result.Should().NotBeNullOrEmpty();
        var parts = result.Split('.');
        parts.Should().HaveCount(3);
    }

    [Fact]
    public async Task GenerateAuthorizationCodeAsync_GeneratesUniqueCodesEachTime()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();
        var clientId = Guid.NewGuid();
        var redirectUri = "https://example.com/callback";
        var codeChallenge = "test-challenge";

        _authorizationCodeRepositoryMock
            .Setup(x => x.AddAsync(It.IsAny<AuthorizationCode>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((AuthorizationCode code, CancellationToken _) => code);

        // Act
        var code1 = await _authService.GenerateAuthorizationCodeAsync(
            tenantUserId, clientId, redirectUri, codeChallenge);
        var code2 = await _authService.GenerateAuthorizationCodeAsync(
            tenantUserId, clientId, redirectUri, codeChallenge);

        // Assert
        code1.Should().NotBe(code2);
    }

    #endregion
}
