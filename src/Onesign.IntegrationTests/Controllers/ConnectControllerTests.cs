using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Onesign.IntegrationTests.Fixtures;

namespace Onesign.IntegrationTests.Controllers;

public class ConnectControllerTests : IClassFixture<InMemoryWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly InMemoryWebApplicationFactory _factory;

    public ConnectControllerTests(InMemoryWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient(new Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false
        });
    }

    #region Authorize Endpoint Tests

    [Fact]
    public async Task Authorize_WithoutRequiredParameters_ReturnsBadRequest()
    {
        // Act
        var response = await _client.GetAsync("/connect/authorize");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Authorize_WithMissingClientId_ReturnsBadRequest()
    {
        // Act
        var response = await _client.GetAsync(
            "/connect/authorize?redirect_uri=https://example.com/callback&response_type=code&scope=openid&state=xyz&code_challenge=abc&code_challenge_method=S256");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Authorize_WithMissingRedirectUri_ReturnsBadRequest()
    {
        // Act
        var response = await _client.GetAsync(
            "/connect/authorize?client_id=test-client&response_type=code&scope=openid&state=xyz&code_challenge=abc&code_challenge_method=S256");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Authorize_WithMissingResponseType_ReturnsBadRequest()
    {
        // Act
        var response = await _client.GetAsync(
            "/connect/authorize?client_id=test-client&redirect_uri=https://example.com/callback&scope=openid&state=xyz&code_challenge=abc&code_challenge_method=S256");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Authorize_WithUnsupportedResponseType_ReturnsBadRequest()
    {
        // Act
        var response = await _client.GetAsync(
            "/connect/authorize?client_id=test-client&redirect_uri=https://example.com/callback&response_type=token&scope=openid&state=xyz&code_challenge=abc&code_challenge_method=S256");
        var content = await response.Content.ReadFromJsonAsync<ErrorResponse>();

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        content!.error.Should().Be("unsupported_response_type");
    }

    [Fact]
    public async Task Authorize_WithMissingCodeChallenge_ReturnsBadRequest()
    {
        // Act
        var response = await _client.GetAsync(
            "/connect/authorize?client_id=test-client&redirect_uri=https://example.com/callback&response_type=code&scope=openid&state=xyz&code_challenge_method=S256");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Authorize_WithUnsupportedCodeChallengeMethod_ReturnsBadRequest()
    {
        // Act
        var response = await _client.GetAsync(
            "/connect/authorize?client_id=test-client&redirect_uri=https://example.com/callback&response_type=code&scope=openid&state=xyz&code_challenge=abc&code_challenge_method=plain");
        var content = await response.Content.ReadFromJsonAsync<ErrorResponse>();

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        content!.error.Should().Be("invalid_request");
    }

    [Fact]
    public async Task Authorize_WithInvalidClientId_ReturnsBadRequest()
    {
        // Act
        var response = await _client.GetAsync(
            "/connect/authorize?client_id=invalid-client&redirect_uri=https://example.com/callback&response_type=code&scope=openid&state=xyz&code_challenge=abc&code_challenge_method=S256");
        var content = await response.Content.ReadFromJsonAsync<ErrorResponse>();

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        content!.error.Should().Be("invalid_client");
    }

    [Fact]
    public async Task Authorize_WithInvalidRedirectUriFormat_ReturnsBadRequest()
    {
        // Act
        var response = await _client.GetAsync(
            "/connect/authorize?client_id=test-client&redirect_uri=invalid-uri&response_type=code&scope=openid&state=xyz&code_challenge=abc&code_challenge_method=S256");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region Token Endpoint Tests

    [Fact]
    public async Task Token_WithoutParameters_ReturnsBadRequest()
    {
        // Act
        var response = await _client.PostAsync("/connect/token", new FormUrlEncodedContent(new Dictionary<string, string>()));

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Token_WithUnsupportedGrantType_ReturnsBadRequest()
    {
        // Arrange
        var content = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["grant_type"] = "password",
            ["username"] = "test@example.com",
            ["password"] = "password"
        });

        // Act
        var response = await _client.PostAsync("/connect/token", content);
        var result = await response.Content.ReadFromJsonAsync<ErrorResponse>();

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        result!.error.Should().Be("unsupported_grant_type");
    }

    [Fact]
    public async Task Token_WithMissingCode_ReturnsBadRequest()
    {
        // Arrange
        var content = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["grant_type"] = "authorization_code",
            ["client_id"] = "test-client",
            ["redirect_uri"] = "https://example.com/callback",
            ["code_verifier"] = "verifier"
        });

        // Act
        var response = await _client.PostAsync("/connect/token", content);
        var result = await response.Content.ReadFromJsonAsync<ErrorResponse>();

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        result!.error.Should().Be("invalid_request");
    }

    [Fact]
    public async Task Token_WithMissingCodeVerifier_ReturnsBadRequest()
    {
        // Arrange
        var content = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["grant_type"] = "authorization_code",
            ["code"] = "some-code",
            ["client_id"] = "test-client",
            ["redirect_uri"] = "https://example.com/callback"
        });

        // Act
        var response = await _client.PostAsync("/connect/token", content);
        var result = await response.Content.ReadFromJsonAsync<ErrorResponse>();

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        result!.error.Should().Be("invalid_request");
    }

    [Fact]
    public async Task Token_WithInvalidAuthorizationCode_ReturnsBadRequest()
    {
        // Arrange
        var content = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["grant_type"] = "authorization_code",
            ["code"] = "invalid-code",
            ["client_id"] = "test-client",
            ["redirect_uri"] = "https://example.com/callback",
            ["code_verifier"] = "verifier"
        });

        // Act
        var response = await _client.PostAsync("/connect/token", content);
        var result = await response.Content.ReadFromJsonAsync<ErrorResponse>();

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        result!.error.Should().Be("invalid_grant");
    }

    [Fact]
    public async Task Token_WithMissingClientId_ReturnsBadRequest()
    {
        // Arrange
        var content = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["grant_type"] = "authorization_code",
            ["code"] = "some-code",
            ["redirect_uri"] = "https://example.com/callback",
            ["code_verifier"] = "verifier"
        });

        // Act
        var response = await _client.PostAsync("/connect/token", content);
        var result = await response.Content.ReadFromJsonAsync<ErrorResponse>();

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        result!.error.Should().Be("invalid_request");
    }

    [Fact]
    public async Task Token_WithMissingRedirectUri_ReturnsBadRequest()
    {
        // Arrange
        var content = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["grant_type"] = "authorization_code",
            ["code"] = "some-code",
            ["client_id"] = "test-client",
            ["code_verifier"] = "verifier"
        });

        // Act
        var response = await _client.PostAsync("/connect/token", content);
        var result = await response.Content.ReadFromJsonAsync<ErrorResponse>();

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        result!.error.Should().Be("invalid_request");
    }

    #endregion
}

public class ErrorResponse
{
    public string error { get; set; } = string.Empty;
    public string error_description { get; set; } = string.Empty;
}
