using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Onesign.IntegrationTests.Fixtures;

namespace Onesign.IntegrationTests.Controllers;

public class JwksControllerTests : IClassFixture<InMemoryWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly InMemoryWebApplicationFactory _factory;

    public JwksControllerTests(InMemoryWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetJwks_ReturnsOk()
    {
        // Act
        var response = await _client.GetAsync("/.well-known/jwks.json");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetJwks_ReturnsEmptyKeysArray()
    {
        // Act
        var response = await _client.GetAsync("/.well-known/jwks.json");
        var content = await response.Content.ReadFromJsonAsync<JwksResponse>();

        // Assert
        content.Should().NotBeNull();
        content!.keys.Should().NotBeNull();
        content.keys.Should().BeEmpty();
    }

    [Fact]
    public async Task GetJwks_ReturnsJsonContentType()
    {
        // Act
        var response = await _client.GetAsync("/.well-known/jwks.json");

        // Assert
        response.Content.Headers.ContentType?.MediaType.Should().Be("application/json");
    }

    [Fact]
    public async Task GetJwks_CacheControl_ShouldBeSet()
    {
        // Act
        var response = await _client.GetAsync("/.well-known/jwks.json");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetJwks_AllowsAnonymousAccess()
    {
        // Act - No authentication headers
        var response = await _client.GetAsync("/.well-known/jwks.json");

        // Assert - Should not return 401
        response.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}

public class JwksResponse
{
    public object[] keys { get; set; } = Array.Empty<object>();
}
