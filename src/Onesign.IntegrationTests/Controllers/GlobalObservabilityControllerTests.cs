using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Onesign.IntegrationTests.Fixtures;

namespace Onesign.IntegrationTests.Controllers;

public class GlobalObservabilityControllerTests : IClassFixture<InMemoryWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly InMemoryWebApplicationFactory _factory;

    public GlobalObservabilityControllerTests(InMemoryWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    #region POST /api/global/observability/audit/search Tests

    [Fact]
    public async Task SearchAuditEvents_ValidRequest_ReturnsOkOrBadRequest()
    {
        // Arrange
        var filter = new
        {
            FromDate = DateTime.UtcNow.AddDays(-7),
            ToDate = DateTime.UtcNow,
            PageNumber = 1,
            PageSize = 20
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/global/observability/audit/search", filter);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task SearchAuditEvents_WithTenantFilter_ReturnsOkOrBadRequest()
    {
        // Arrange
        var filter = new
        {
            TenantId = Guid.NewGuid(),
            FromDate = DateTime.UtcNow.AddDays(-30),
            ToDate = DateTime.UtcNow
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/global/observability/audit/search", filter);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task SearchAuditEvents_WithAllFilters_ReturnsOkOrBadRequest()
    {
        // Arrange
        var filter = new
        {
            TenantId = Guid.NewGuid(),
            EventType = "Login",
            ActorId = Guid.NewGuid(),
            FromDate = DateTime.UtcNow.AddDays(-90),
            ToDate = DateTime.UtcNow,
            PageNumber = 1,
            PageSize = 50
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/global/observability/audit/search", filter);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task SearchAuditEvents_EmptyBody_ReturnsOkOrBadRequest()
    {
        // Act
        var response = await _client.PostAsJsonAsync("/api/global/observability/audit/search", new { });

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task SearchAuditEvents_LargeDateRange_ReturnsOkOrBadRequest()
    {
        // Arrange
        var filter = new
        {
            FromDate = DateTime.UtcNow.AddYears(-1),
            ToDate = DateTime.UtcNow
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/global/observability/audit/search", filter);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    #endregion

    #region GET /api/global/observability/audit/{id} Tests

    [Fact]
    public async Task GetAuditEvent_NonExistent_ReturnsNotFound()
    {
        // Arrange
        var eventId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/global/observability/audit/{eventId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetAuditEvent_InvalidGuid_ReturnsBadRequest()
    {
        // Act
        var response = await _client.GetAsync("/api/global/observability/audit/invalid-guid");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.BadRequest, HttpStatusCode.NotFound);
    }

    #endregion
}
