using System.Net;
using System.Text;
using System.Text.Json;
using FluentAssertions;
using Moq;
using Moq.Protected;
using Onesign.Sdk.DotNet;
using Onesign.Sdk.DotNet.Models;
using Xunit;

namespace Onesign.Api.Tests.Sdk;

public class OnesignClientTests
{
    private readonly Mock<HttpMessageHandler> _mockHandler;
    private readonly HttpClient _httpClient;
    private readonly OnesignOptions _options;

    public OnesignClientTests()
    {
        _mockHandler = new Mock<HttpMessageHandler>();
        _httpClient = new HttpClient(_mockHandler.Object);
        _options = new OnesignOptions
        {
            BaseUrl = "https://auth.example.com",
            ClientId = "test-client",
            ClientSecret = "test-secret",
            RedirectUri = "https://app.example.com/callback",
            TenantId = "tenant-123"
        };
    }

    [Fact]
    public void Constructor_WithSimpleParameters_CreatesClient()
    {
        // Act
        using var client = new OnesignClient("https://auth.example.com", "client-id", "client-secret");

        // Assert
        client.Should().NotBeNull();
        client.Auth.Should().NotBeNull();
        client.Users.Should().NotBeNull();
        client.Applications.Should().NotBeNull();
        client.Tenants.Should().NotBeNull();
    }

    [Fact]
    public void Constructor_WithOptions_CreatesClient()
    {
        // Act
        using var client = new OnesignClient(_options, _httpClient);

        // Assert
        client.Should().NotBeNull();
        client.Auth.Should().NotBeNull();
        client.Users.Should().NotBeNull();
        client.Applications.Should().NotBeNull();
        client.Tenants.Should().NotBeNull();
    }

    [Fact]
    public void Constructor_WithNullOptions_ThrowsArgumentNullException()
    {
        // Act & Assert
        var act = () => new OnesignClient(null!, _httpClient);
        act.Should().Throw<ArgumentNullException>().WithParameterName("options");
    }

    [Fact]
    public void Constructor_WithNullHttpClient_CreatesNewHttpClient()
    {
        // Act
        using var client = new OnesignClient(_options);

        // Assert
        client.Should().NotBeNull();
    }

    [Fact]
    public void Constructor_ConfiguresHttpClient()
    {
        // Act
        using var client = new OnesignClient(_options, _httpClient);

        // Assert
        _httpClient.BaseAddress.Should().Be(new Uri("https://auth.example.com"));
        _httpClient.Timeout.Should().Be(_options.Timeout);
        _httpClient.DefaultRequestHeaders.Accept.Should().ContainSingle(h => h.MediaType == "application/json");
    }

    [Fact]
    public void Constructor_TrimsTrailingSlashFromBaseUrl()
    {
        // Arrange
        var options = new OnesignOptions
        {
            BaseUrl = "https://auth.example.com/",
            ClientId = "test",
            ClientSecret = "test"
        };

        // Act
        using var client = new OnesignClient(options, _httpClient);

        // Assert
        _httpClient.BaseAddress.Should().Be(new Uri("https://auth.example.com"));
    }

    [Fact]
    public void BuildAuthorizeUrl_ReturnsValidUrl_WithState()
    {
        // Arrange
        using var client = new OnesignClient(_options, _httpClient);

        // Act
        var (authorizeUrl, codeVerifier) = client.BuildAuthorizeUrl("test-state");

        // Assert
        authorizeUrl.Should().StartWith("https://auth.example.com/connect/authorize");
        authorizeUrl.Should().Contain("client_id=test-client");
        authorizeUrl.Should().Contain("redirect_uri=");
        authorizeUrl.Should().Contain("response_type=code");
        authorizeUrl.Should().Contain("scope=openid%20profile%20email");
        authorizeUrl.Should().Contain("code_challenge=");
        authorizeUrl.Should().Contain("code_challenge_method=S256");
        authorizeUrl.Should().Contain("state=test-state");
        authorizeUrl.Should().Contain("tenantId=tenant-123");
        codeVerifier.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public void BuildAuthorizeUrl_ReturnsValidUrl_WithoutState()
    {
        // Arrange
        using var client = new OnesignClient(_options, _httpClient);

        // Act
        var (authorizeUrl, codeVerifier) = client.BuildAuthorizeUrl();

        // Assert
        authorizeUrl.Should().StartWith("https://auth.example.com/connect/authorize");
        authorizeUrl.Should().NotContain("state=");
        codeVerifier.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public void BuildAuthorizeUrl_WithoutTenantId_ExcludesTenantIdParameter()
    {
        // Arrange
        var options = new OnesignOptions
        {
            BaseUrl = "https://auth.example.com",
            ClientId = "test-client",
            ClientSecret = "test-secret",
            RedirectUri = "https://app.example.com/callback"
        };
        using var client = new OnesignClient(options, _httpClient);

        // Act
        var (authorizeUrl, _) = client.BuildAuthorizeUrl();

        // Assert
        authorizeUrl.Should().NotContain("tenantId=");
    }

    [Fact]
    public void BuildAuthorizeUrl_GeneratesUniqueCodeVerifier()
    {
        // Arrange
        using var client = new OnesignClient(_options, _httpClient);

        // Act
        var (_, codeVerifier1) = client.BuildAuthorizeUrl();
        var (_, codeVerifier2) = client.BuildAuthorizeUrl();

        // Assert
        codeVerifier1.Should().NotBe(codeVerifier2);
    }

    [Fact]
    public async Task ExchangeCodeForTokenAsync_Success_ReturnsToken()
    {
        // Arrange
        var tokenResponse = new TokenResponse
        {
            AccessToken = "access-token",
            TokenType = "Bearer",
            ExpiresIn = 3600,
            RefreshToken = "refresh-token"
        };

        SetupMockResponse(
            HttpStatusCode.OK,
            JsonSerializer.Serialize(tokenResponse));

        using var client = new OnesignClient(_options, _httpClient);

        // Act
        var result = await client.ExchangeCodeForTokenAsync("auth-code", "code-verifier");

        // Assert
        result.Should().NotBeNull();
        result!.AccessToken.Should().Be("access-token");
        result.RefreshToken.Should().Be("refresh-token");
    }

    [Fact]
    public async Task ExchangeCodeForTokenAsync_Failure_ReturnsNull()
    {
        // Arrange
        SetupMockResponse(HttpStatusCode.BadRequest, "Invalid code");

        using var client = new OnesignClient(_options, _httpClient);

        // Act
        var result = await client.ExchangeCodeForTokenAsync("invalid-code", "code-verifier");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task ExchangeCodeForTokenAsync_SendsCorrectFormData()
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

        using var client = new OnesignClient(_options, _httpClient);

        // Act
        await client.ExchangeCodeForTokenAsync("auth-code", "code-verifier");

        // Assert
        capturedRequest.Should().NotBeNull();
        capturedRequest!.Method.Should().Be(HttpMethod.Post);
        capturedRequest.RequestUri!.PathAndQuery.Should().Be("/connect/token");

        var content = await capturedRequest.Content!.ReadAsStringAsync();
        content.Should().Contain("grant_type=authorization_code");
        content.Should().Contain("code=auth-code");
        content.Should().Contain("code_verifier=code-verifier");
        content.Should().Contain("client_id=test-client");
    }

    [Fact]
    public async Task ExchangeCodeForTokenAsync_SupportsCancellation()
    {
        // Arrange
        var cts = new CancellationTokenSource();
        cts.Cancel();

        SetupMockResponse(HttpStatusCode.OK, "{}");

        using var client = new OnesignClient(_options, _httpClient);

        // Act & Assert
        await Assert.ThrowsAsync<TaskCanceledException>(
            () => client.ExchangeCodeForTokenAsync("code", "verifier", cts.Token));
    }

    [Fact]
    public void Dispose_WithOwnedHttpClient_DisposesHttpClient()
    {
        // Arrange
        var client = new OnesignClient(_options);

        // Act & Assert - should not throw
        client.Dispose();
    }

    [Fact]
    public void Dispose_WithProvidedHttpClient_DoesNotDisposeHttpClient()
    {
        // Arrange
        var client = new OnesignClient(_options, _httpClient);

        // Act
        client.Dispose();

        // Assert - httpClient should still be usable
        _httpClient.BaseAddress.Should().NotBeNull();
    }

    [Theory]
    [InlineData("https://auth.example.com")]
    [InlineData("https://auth.example.com/")]
    [InlineData("http://localhost:5000")]
    [InlineData("http://localhost:5000/")]
    public void Constructor_HandlesVariousBaseUrls(string baseUrl)
    {
        // Arrange
        var options = new OnesignOptions
        {
            BaseUrl = baseUrl,
            ClientId = "test",
            ClientSecret = "test"
        };

        // Act
        using var client = new OnesignClient(options, _httpClient);

        // Assert
        _httpClient.BaseAddress!.ToString().Should().NotEndWith("/");
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
