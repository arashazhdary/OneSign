using System.Net;
using System.Text;
using System.Text.Json;
using FluentAssertions;
using Moq;
using Moq.Protected;
using Onesign.Sdk.DotNet;
using Onesign.Sdk.DotNet.Models;
using Onesign.Sdk.DotNet.Services;
using Xunit;

namespace Onesign.Api.Tests.Sdk;

public class AuthServiceTests
{
    private readonly Mock<HttpMessageHandler> _mockHandler;
    private readonly HttpClient _httpClient;
    private readonly OnesignOptions _options;
    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        _mockHandler = new Mock<HttpMessageHandler>();
        _httpClient = new HttpClient(_mockHandler.Object)
        {
            BaseAddress = new Uri("https://auth.example.com")
        };
        _options = new OnesignOptions
        {
            BaseUrl = "https://auth.example.com",
            ClientId = "test-client",
            ClientSecret = "test-secret"
        };
        _authService = new AuthService(_httpClient, _options);
    }

    [Fact]
    public async Task LoginAsync_Success_ReturnsTokenAndCachesIt()
    {
        // Arrange
        var tokenResponse = new TokenResponse
        {
            AccessToken = "access-token-123",
            TokenType = "Bearer",
            ExpiresIn = 3600,
            RefreshToken = "refresh-token-456"
        };

        SetupMockResponse(HttpStatusCode.OK, JsonSerializer.Serialize(tokenResponse));

        // Act
        var result = await _authService.LoginAsync("user@example.com", "password");

        // Assert
        result.Should().NotBeNull();
        result.AccessToken.Should().Be("access-token-123");
        result.RefreshToken.Should().Be("refresh-token-456");
        result.ExpiresAt.Should().BeCloseTo(DateTimeOffset.UtcNow.AddSeconds(3600), TimeSpan.FromSeconds(5));

        _authService.GetCachedToken().Should().NotBeNull();
        _authService.GetCachedToken()!.AccessToken.Should().Be("access-token-123");
    }

    [Fact]
    public async Task LoginAsync_Failure_ThrowsOnesignException()
    {
        // Arrange
        var errorResponse = new ErrorResponse
        {
            Error = "invalid_credentials",
            ErrorDescription = "Invalid email or password"
        };

        SetupMockResponse(HttpStatusCode.Unauthorized, JsonSerializer.Serialize(errorResponse));

        // Act & Assert
        var act = () => _authService.LoginAsync("user@example.com", "wrong-password");
        await act.Should().ThrowAsync<OnesignException>()
            .Where(e => e.Message == "Invalid email or password" && e.StatusCode == HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task ClientCredentialsAsync_Success_ReturnsTokenAndCachesIt()
    {
        // Arrange
        var tokenResponse = new TokenResponse
        {
            AccessToken = "client-access-token",
            TokenType = "Bearer",
            ExpiresIn = 3600
        };

        SetupMockResponse(HttpStatusCode.OK, JsonSerializer.Serialize(tokenResponse));

        // Act
        var result = await _authService.ClientCredentialsAsync();

        // Assert
        result.Should().NotBeNull();
        result.AccessToken.Should().Be("client-access-token");
        result.ExpiresAt.Should().BeCloseTo(DateTimeOffset.UtcNow.AddSeconds(3600), TimeSpan.FromSeconds(5));
    }

    [Fact]
    public async Task ClientCredentialsAsync_SendsCorrectFormData()
    {
        // Arrange
        HttpRequestMessage? capturedRequest = null;
        _mockHandler.Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .Callback<HttpRequestMessage, CancellationToken>((req, _) => capturedRequest = req)
            .ReturnsAsync(new HttpResponseMessage
            {
                StatusCode = HttpStatusCode.OK,
                Content = new StringContent(JsonSerializer.Serialize(new TokenResponse
                {
                    AccessToken = "token",
                    ExpiresIn = 3600
                }))
            });

        // Act
        await _authService.ClientCredentialsAsync();

        // Assert
        capturedRequest.Should().NotBeNull();
        var content = await capturedRequest!.Content!.ReadAsStringAsync();
        content.Should().Contain("grant_type=client_credentials");
        content.Should().Contain($"client_id={_options.ClientId}");
        content.Should().Contain($"client_secret={_options.ClientSecret}");
        content.Should().Contain("scope=openid+profile+email+api");
    }

    [Fact]
    public async Task LogoutAsync_WithCachedToken_SendsLogoutRequest()
    {
        // Arrange
        var token = new TokenResponse
        {
            AccessToken = "access-token",
            ExpiresIn = 3600
        };
        _authService.SetToken(token);

        HttpRequestMessage? capturedRequest = null;
        _mockHandler.Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .Callback<HttpRequestMessage, CancellationToken>((req, _) => capturedRequest = req)
            .ReturnsAsync(new HttpResponseMessage { StatusCode = HttpStatusCode.OK });

        // Act
        await _authService.LogoutAsync();

        // Assert
        capturedRequest.Should().NotBeNull();
        capturedRequest!.Method.Should().Be(HttpMethod.Post);
        capturedRequest.RequestUri!.PathAndQuery.Should().Be("/api/auth/logout");
        capturedRequest.Headers.Authorization.Should().NotBeNull();
        capturedRequest.Headers.Authorization!.Scheme.Should().Be("Bearer");
        capturedRequest.Headers.Authorization.Parameter.Should().Be("access-token");

        _authService.GetCachedToken().Should().BeNull();
    }

    [Fact]
    public async Task LogoutAsync_WithoutCachedToken_DoesNothing()
    {
        // Arrange - no token set

        // Act
        await _authService.LogoutAsync();

        // Assert - should not throw
        _authService.GetCachedToken().Should().BeNull();
    }

    [Fact]
    public async Task RefreshTokenAsync_WithProvidedToken_Success()
    {
        // Arrange
        var tokenResponse = new TokenResponse
        {
            AccessToken = "new-access-token",
            TokenType = "Bearer",
            ExpiresIn = 3600,
            RefreshToken = "new-refresh-token"
        };

        SetupMockResponse(HttpStatusCode.OK, JsonSerializer.Serialize(tokenResponse));

        // Act
        var result = await _authService.RefreshTokenAsync("old-refresh-token");

        // Assert
        result.Should().NotBeNull();
        result.AccessToken.Should().Be("new-access-token");
        result.RefreshToken.Should().Be("new-refresh-token");
    }

    [Fact]
    public async Task RefreshTokenAsync_WithCachedToken_UsesRefreshToken()
    {
        // Arrange
        var cachedToken = new TokenResponse
        {
            AccessToken = "old-access",
            RefreshToken = "cached-refresh-token",
            ExpiresIn = 3600
        };
        _authService.SetToken(cachedToken);

        var newTokenResponse = new TokenResponse
        {
            AccessToken = "new-access-token",
            TokenType = "Bearer",
            ExpiresIn = 3600
        };

        HttpRequestMessage? capturedRequest = null;
        _mockHandler.Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .Callback<HttpRequestMessage, CancellationToken>((req, _) => capturedRequest = req)
            .ReturnsAsync(new HttpResponseMessage
            {
                StatusCode = HttpStatusCode.OK,
                Content = new StringContent(JsonSerializer.Serialize(newTokenResponse))
            });

        // Act
        await _authService.RefreshTokenAsync();

        // Assert
        var content = await capturedRequest!.Content!.ReadAsStringAsync();
        content.Should().Contain("refresh_token=cached-refresh-token");
    }

    [Fact]
    public async Task RefreshTokenAsync_WithoutAnyToken_ThrowsException()
    {
        // Act & Assert
        var act = () => _authService.RefreshTokenAsync();
        await act.Should().ThrowAsync<OnesignException>()
            .WithMessage("No refresh token available");
    }

    [Fact]
    public async Task ValidateTokenAsync_ReturnsValidationResult()
    {
        // Arrange
        var validationResult = new TokenValidationResult
        {
            Active = true,
            Subject = "user-123",
            ClientId = "test-client",
            ExpiresAt = DateTimeOffset.UtcNow.AddHours(1).ToUnixTimeSeconds()
        };

        SetupMockResponse(HttpStatusCode.OK, JsonSerializer.Serialize(validationResult));

        // Act
        var result = await _authService.ValidateTokenAsync("some-token");

        // Assert
        result.Should().NotBeNull();
        result.Active.Should().BeTrue();
        result.Subject.Should().Be("user-123");
        result.ClientId.Should().Be("test-client");
    }

    [Fact]
    public async Task GetAccessTokenAsync_WithoutCachedToken_CallsClientCredentials()
    {
        // Arrange
        var tokenResponse = new TokenResponse
        {
            AccessToken = "new-token",
            ExpiresIn = 3600
        };

        SetupMockResponse(HttpStatusCode.OK, JsonSerializer.Serialize(tokenResponse));

        // Act
        var result = await _authService.GetAccessTokenAsync();

        // Assert
        result.Should().Be("new-token");
    }

    [Fact]
    public async Task GetAccessTokenAsync_WithValidCachedToken_ReturnsCachedToken()
    {
        // Arrange
        var cachedToken = new TokenResponse
        {
            AccessToken = "cached-token",
            ExpiresIn = 3600,
            ExpiresAt = DateTimeOffset.UtcNow.AddHours(1)
        };
        _authService.SetToken(cachedToken);

        // Act
        var result = await _authService.GetAccessTokenAsync();

        // Assert
        result.Should().Be("cached-token");
    }

    [Fact]
    public async Task GetAccessTokenAsync_WithExpiredTokenAndRefreshToken_RefreshesToken()
    {
        // Arrange
        var expiredToken = new TokenResponse
        {
            AccessToken = "expired-token",
            RefreshToken = "refresh-token",
            ExpiresIn = 3600,
            ExpiresAt = DateTimeOffset.UtcNow.AddHours(-1) // Expired
        };
        _authService.SetToken(expiredToken);

        var newTokenResponse = new TokenResponse
        {
            AccessToken = "refreshed-token",
            ExpiresIn = 3600
        };

        SetupMockResponse(HttpStatusCode.OK, JsonSerializer.Serialize(newTokenResponse));

        // Act
        var result = await _authService.GetAccessTokenAsync();

        // Assert
        result.Should().Be("refreshed-token");
    }

    [Fact]
    public async Task GetAccessTokenAsync_WithExpiredTokenAndNoRefreshToken_CallsClientCredentials()
    {
        // Arrange
        var expiredToken = new TokenResponse
        {
            AccessToken = "expired-token",
            ExpiresIn = 3600,
            ExpiresAt = DateTimeOffset.UtcNow.AddHours(-1) // Expired
        };
        _authService.SetToken(expiredToken);

        var newTokenResponse = new TokenResponse
        {
            AccessToken = "new-cc-token",
            ExpiresIn = 3600
        };

        SetupMockResponse(HttpStatusCode.OK, JsonSerializer.Serialize(newTokenResponse));

        // Act
        var result = await _authService.GetAccessTokenAsync();

        // Assert
        result.Should().Be("new-cc-token");
    }

    [Fact]
    public void SetToken_CachesToken()
    {
        // Arrange
        var token = new TokenResponse
        {
            AccessToken = "test-token",
            ExpiresIn = 3600
        };

        // Act
        _authService.SetToken(token);

        // Assert
        _authService.GetCachedToken().Should().NotBeNull();
        _authService.GetCachedToken()!.AccessToken.Should().Be("test-token");
    }

    [Fact]
    public void GetCachedToken_WithNoToken_ReturnsNull()
    {
        // Act
        var result = _authService.GetCachedToken();

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task LoginAsync_WithInvalidJson_ThrowsOnesignException()
    {
        // Arrange
        SetupMockResponse(HttpStatusCode.BadRequest, "not valid json");

        // Act & Assert
        var act = () => _authService.LoginAsync("user@example.com", "password");
        await act.Should().ThrowAsync<OnesignException>();
    }

    [Fact]
    public async Task GetAccessTokenAsync_IsThreadSafe()
    {
        // Arrange
        var tokenResponse = new TokenResponse
        {
            AccessToken = "thread-safe-token",
            ExpiresIn = 3600
        };

        SetupMockResponse(HttpStatusCode.OK, JsonSerializer.Serialize(tokenResponse));

        // Act
        var tasks = Enumerable.Range(0, 10)
            .Select(_ => _authService.GetAccessTokenAsync())
            .ToArray();

        var results = await Task.WhenAll(tasks);

        // Assert
        results.Should().AllBe("thread-safe-token");
    }

    private void SetupMockResponse(HttpStatusCode statusCode, string content)
    {
        _mockHandler.Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(new HttpResponseMessage
            {
                StatusCode = statusCode,
                Content = new StringContent(content, Encoding.UTF8, "application/json")
            });
    }
}
