using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Onesign.IntegrationTests.Fixtures;

namespace Onesign.IntegrationTests.Controllers;

public class ChangeSetsControllerTests : IClassFixture<InMemoryWebApplicationFactory>
{
    private readonly HttpClient _client;

    public ChangeSetsControllerTests(InMemoryWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task ListGlobalChangeSets_WithoutAuth_ReturnsUnauthorized()
    {
        var response = await _client.GetAsync("/api/global/changesets");
        response.StatusCode.Should().BeOneOf(HttpStatusCode.Unauthorized, HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task CreateChangeSet_WithoutAuth_ReturnsUnauthorized()
    {
        var response = await _client.PostAsJsonAsync("/api/global/changesets", new { title = "test", description = "ci" });
        response.StatusCode.Should().BeOneOf(HttpStatusCode.Unauthorized, HttpStatusCode.Forbidden);
    }
}
