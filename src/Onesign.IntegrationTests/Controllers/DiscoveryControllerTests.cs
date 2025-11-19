using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Onesign.IntegrationTests.Fixtures;

namespace Onesign.IntegrationTests.Controllers;

public class DiscoveryControllerTests : IClassFixture<InMemoryWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly InMemoryWebApplicationFactory _factory;

    public DiscoveryControllerTests(InMemoryWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetOpenIdConfiguration_ReturnsOk()
    {
        // Act
        var response = await _client.GetAsync("/.well-known/openid-configuration");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetOpenIdConfiguration_ReturnsValidConfiguration()
    {
        // Act
        var response = await _client.GetAsync("/.well-known/openid-configuration");
        var config = await response.Content.ReadFromJsonAsync<OpenIdConfiguration>();

        // Assert
        config.Should().NotBeNull();
        config!.issuer.Should().NotBeNullOrEmpty();
        config.authorization_endpoint.Should().Contain("/connect/authorize");
        config.token_endpoint.Should().Contain("/connect/token");
        config.userinfo_endpoint.Should().Contain("/connect/userinfo");
        config.jwks_uri.Should().Contain("/.well-known/jwks.json");
    }

    [Fact]
    public async Task GetOpenIdConfiguration_ContainsRequiredResponseTypes()
    {
        // Act
        var response = await _client.GetAsync("/.well-known/openid-configuration");
        var config = await response.Content.ReadFromJsonAsync<OpenIdConfiguration>();

        // Assert
        config!.response_types_supported.Should().Contain("code");
    }

    [Fact]
    public async Task GetOpenIdConfiguration_ContainsRequiredScopes()
    {
        // Act
        var response = await _client.GetAsync("/.well-known/openid-configuration");
        var config = await response.Content.ReadFromJsonAsync<OpenIdConfiguration>();

        // Assert
        config!.scopes_supported.Should().Contain("openid");
        config.scopes_supported.Should().Contain("profile");
        config.scopes_supported.Should().Contain("email");
    }

    [Fact]
    public async Task GetOpenIdConfiguration_ContainsSigningAlgorithms()
    {
        // Act
        var response = await _client.GetAsync("/.well-known/openid-configuration");
        var config = await response.Content.ReadFromJsonAsync<OpenIdConfiguration>();

        // Assert
        config!.id_token_signing_alg_values_supported.Should().Contain("HS256");
    }

    [Fact]
    public async Task GetOpenIdConfiguration_ContainsPkceSupport()
    {
        // Act
        var response = await _client.GetAsync("/.well-known/openid-configuration");
        var config = await response.Content.ReadFromJsonAsync<OpenIdConfiguration>();

        // Assert
        config!.code_challenge_methods_supported.Should().Contain("S256");
    }

    [Fact]
    public async Task GetOpenIdConfiguration_WithTenantParameter_ReturnsCorrectIssuer()
    {
        // Arrange
        var tenantSlug = "test-tenant";

        // Act
        var response = await _client.GetAsync($"/.well-known/openid-configuration?tenant={tenantSlug}");
        var config = await response.Content.ReadFromJsonAsync<OpenIdConfiguration>();

        // Assert
        config!.issuer.Should().Contain(tenantSlug);
    }

    [Fact]
    public async Task GetOpenIdConfiguration_AllowsAnonymousAccess()
    {
        // Act
        var response = await _client.GetAsync("/.well-known/openid-configuration");

        // Assert
        response.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetOpenIdConfiguration_ReturnsJsonContentType()
    {
        // Act
        var response = await _client.GetAsync("/.well-known/openid-configuration");

        // Assert
        response.Content.Headers.ContentType?.MediaType.Should().Be("application/json");
    }

    [Fact]
    public async Task GetOpenIdConfiguration_ContainsGrantTypesSupported()
    {
        // Act
        var response = await _client.GetAsync("/.well-known/openid-configuration");
        var config = await response.Content.ReadFromJsonAsync<OpenIdConfiguration>();

        // Assert
        config!.grant_types_supported.Should().Contain("authorization_code");
    }
}

public class OpenIdConfiguration
{
    public string issuer { get; set; } = string.Empty;
    public string authorization_endpoint { get; set; } = string.Empty;
    public string token_endpoint { get; set; } = string.Empty;
    public string userinfo_endpoint { get; set; } = string.Empty;
    public string jwks_uri { get; set; } = string.Empty;
    public string[] response_types_supported { get; set; } = Array.Empty<string>();
    public string[] subject_types_supported { get; set; } = Array.Empty<string>();
    public string[] id_token_signing_alg_values_supported { get; set; } = Array.Empty<string>();
    public string[] scopes_supported { get; set; } = Array.Empty<string>();
    public string[] code_challenge_methods_supported { get; set; } = Array.Empty<string>();
    public string[] grant_types_supported { get; set; } = Array.Empty<string>();
}
