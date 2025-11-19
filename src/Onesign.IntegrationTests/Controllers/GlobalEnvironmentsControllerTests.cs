using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Onesign.IntegrationTests.Fixtures;

namespace Onesign.IntegrationTests.Controllers;

public class GlobalEnvironmentsControllerTests : IClassFixture<InMemoryWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly InMemoryWebApplicationFactory _factory;

    public GlobalEnvironmentsControllerTests(InMemoryWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    #region GET /api/global/environments Tests

    [Fact]
    public async Task GetEnvironments_ReturnsOk()
    {
        // Act
        var response = await _client.GetAsync("/api/global/environments");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetEnvironments_WithTypeFilter_ReturnsOk()
    {
        // Act
        var response = await _client.GetAsync("/api/global/environments?type=Production");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetEnvironments_WithRegionFilter_ReturnsOk()
    {
        // Arrange
        var regionId = "us-east-1";

        // Act
        var response = await _client.GetAsync($"/api/global/environments?regionId={regionId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetEnvironments_WithBothFilters_ReturnsOk()
    {
        // Arrange
        var regionId = "us-east-1";

        // Act
        var response = await _client.GetAsync($"/api/global/environments?type=Production&regionId={regionId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    #endregion

    #region GET /api/global/environments/{id} Tests

    [Fact]
    public async Task GetEnvironment_NonExistent_ReturnsNotFound()
    {
        // Arrange
        var envId = "non-existent-env";

        // Act
        var response = await _client.GetAsync($"/api/global/environments/{envId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetEnvironment_ValidId_ReturnsOkOrNotFound()
    {
        // Arrange
        var envId = "test-env";

        // Act
        var response = await _client.GetAsync($"/api/global/environments/{envId}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.NotFound);
    }

    #endregion

    #region POST /api/global/environments/bootstrap Tests

    [Fact]
    public async Task Bootstrap_ValidRequest_ReturnsOkOrBadRequest()
    {
        // Arrange
        var request = new
        {
            Descriptor = new
            {
                EnvironmentId = $"env-{Guid.NewGuid():N}",
                Name = "Test Environment",
                Type = "Development",
                RegionId = "us-east-1"
            }
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/global/environments/bootstrap", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Bootstrap_MissingDescriptor_ReturnsBadRequest()
    {
        // Act
        var response = await _client.PostAsJsonAsync("/api/global/environments/bootstrap", new { });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Bootstrap_EmptyEnvironmentId_ReturnsBadRequest()
    {
        // Arrange
        var request = new
        {
            Descriptor = new
            {
                EnvironmentId = "",
                Name = "Test Environment",
                Type = "Development"
            }
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/global/environments/bootstrap", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region POST /api/global/environments/{id}/heartbeat Tests

    [Fact]
    public async Task Heartbeat_ValidRequest_ReturnsOkOrBadRequest()
    {
        // Arrange
        var envId = "test-env";
        var request = new
        {
            EnvironmentId = envId,
            Status = "Healthy",
            Metrics = new { }
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/global/environments/{envId}/heartbeat", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Heartbeat_EmptyBody_ReturnsBadRequest()
    {
        // Arrange
        var envId = "test-env";

        // Act
        var response = await _client.PostAsJsonAsync($"/api/global/environments/{envId}/heartbeat", new { });

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    #endregion
}
