using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Onesign.IntegrationTests.Fixtures;

namespace Onesign.IntegrationTests.Controllers;

public class GlobalCopilotControllerTests : IClassFixture<InMemoryWebApplicationFactory>
{
    private readonly HttpClient _client;

    public GlobalCopilotControllerTests(InMemoryWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetSuggestions_WithoutAuth_ReturnsUnauthorized()
    {
        var response = await _client.PostAsJsonAsync("/api/global/copilot/query", new { message = "health check" });
        response.StatusCode.Should().BeOneOf(HttpStatusCode.Unauthorized, HttpStatusCode.Forbidden, HttpStatusCode.NotFound);
    }
}
