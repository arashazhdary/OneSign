using System.Net;
using FluentAssertions;
using Onesign.IntegrationTests.Fixtures;

namespace Onesign.IntegrationTests.Controllers;

public class PlatformControllerTests : IClassFixture<InMemoryWebApplicationFactory>
{
    private readonly HttpClient _client;

    public PlatformControllerTests(InMemoryWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetVersion_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/global/platform/version");
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetHealth_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/global/platform/health");
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetOpenApiSpec_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/global/platform/docs/openapi");
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetMigrations_WithoutAuth_ReturnsUnauthorized()
    {
        var response = await _client.GetAsync("/api/global/platform/migrations");
        response.StatusCode.Should().BeOneOf(HttpStatusCode.Unauthorized, HttpStatusCode.Forbidden);
    }
}
