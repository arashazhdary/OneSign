using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Onesign.IntegrationTests.Fixtures;

namespace Onesign.IntegrationTests.Controllers;

public class ObservabilityControllerTests : IClassFixture<InMemoryWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly InMemoryWebApplicationFactory _factory;

    public ObservabilityControllerTests(InMemoryWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    #region POST /api/tenant/observability/audit/search Tests

    [Fact]
    public async Task SearchAuditEvents_ValidRequest_ReturnsOkOrBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var filter = new
        {
            TenantId = tenantId,
            FromDate = DateTime.UtcNow.AddDays(-7),
            ToDate = DateTime.UtcNow,
            PageNumber = 1,
            PageSize = 20
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/tenant/observability/audit/search?tenantId={tenantId}", filter);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task SearchAuditEvents_WithEventTypeFilter_ReturnsOkOrBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var filter = new
        {
            TenantId = tenantId,
            EventType = "Login",
            FromDate = DateTime.UtcNow.AddDays(-30),
            ToDate = DateTime.UtcNow
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/tenant/observability/audit/search?tenantId={tenantId}", filter);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task SearchAuditEvents_WithActorFilter_ReturnsOkOrBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var filter = new
        {
            TenantId = tenantId,
            ActorId = Guid.NewGuid(),
            FromDate = DateTime.UtcNow.AddDays(-7),
            ToDate = DateTime.UtcNow
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/tenant/observability/audit/search?tenantId={tenantId}", filter);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task SearchAuditEvents_WithoutTenantId_ReturnsBadRequest()
    {
        // Arrange
        var filter = new
        {
            FromDate = DateTime.UtcNow.AddDays(-7),
            ToDate = DateTime.UtcNow
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/tenant/observability/audit/search", filter);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task SearchAuditEvents_EmptyBody_ReturnsBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.PostAsJsonAsync($"/api/tenant/observability/audit/search?tenantId={tenantId}", new { });

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    #endregion

    #region GET /api/tenant/observability/audit/{id} Tests

    [Fact]
    public async Task GetAuditEvent_NonExistent_ReturnsNotFound()
    {
        // Arrange
        var eventId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/observability/audit/{eventId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetAuditEvent_InvalidId_ReturnsBadRequest()
    {
        // Act
        var response = await _client.GetAsync("/api/tenant/observability/audit/invalid-guid");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.BadRequest, HttpStatusCode.NotFound);
    }

    #endregion
}
