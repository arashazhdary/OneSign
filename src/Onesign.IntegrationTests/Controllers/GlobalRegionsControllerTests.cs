using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Onesign.IntegrationTests.Fixtures;

namespace Onesign.IntegrationTests.Controllers;

public class GlobalRegionsControllerTests : IClassFixture<InMemoryWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly InMemoryWebApplicationFactory _factory;

    public GlobalRegionsControllerTests(InMemoryWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    #region GET /api/global/regions Tests

    [Fact]
    public async Task GetRegions_ReturnsOk()
    {
        // Act
        var response = await _client.GetAsync("/api/global/regions");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    #endregion

    #region GET /api/global/regions/health Tests

    [Fact]
    public async Task GetRegionsHealth_ReturnsOkOrBadRequest()
    {
        // Act
        var response = await _client.GetAsync("/api/global/regions/health");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    #endregion

    #region POST /api/global/regions Tests

    [Fact]
    public async Task CreateRegion_ValidRequest_ReturnsOkOrBadRequest()
    {
        // Arrange
        var request = new
        {
            Name = $"Test Region {Guid.NewGuid():N}",
            Code = $"REG-{Guid.NewGuid():N}".Substring(0, 10),
            Location = "US-East"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/global/regions", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateRegion_EmptyBody_ReturnsBadRequest()
    {
        // Act
        var response = await _client.PostAsJsonAsync("/api/global/regions", new { });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region PUT /api/global/regions/{id} Tests

    [Fact]
    public async Task UpdateRegion_ReturnsOk()
    {
        // Arrange
        var regionId = "test-region";

        // Act
        var response = await _client.PutAsJsonAsync($"/api/global/regions/{regionId}", new { Name = "Updated" });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    #endregion

    #region DELETE /api/global/regions/{id} Tests

    [Fact]
    public async Task DeleteRegion_ReturnsOk()
    {
        // Arrange
        var regionId = "test-region";

        // Act
        var response = await _client.DeleteAsync($"/api/global/regions/{regionId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    #endregion

    #region GET /api/global/regions/{regionId}/backups Tests

    [Fact]
    public async Task GetRegionBackups_ReturnsOk()
    {
        // Arrange
        var regionId = "test-region";

        // Act
        var response = await _client.GetAsync($"/api/global/regions/{regionId}/backups");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    #endregion

    #region POST /api/global/regions/{regionId}/backups Tests

    [Fact]
    public async Task CreateRegionBackup_ReturnsOk()
    {
        // Arrange
        var regionId = "test-region";

        // Act
        var response = await _client.PostAsync($"/api/global/regions/{regionId}/backups", null);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    #endregion

    #region Tenant Data Residency Tests

    [Fact]
    public async Task GetTenantDataResidency_ReturnsOk()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/global/regions/tenants/{tenantId}/data-residency");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task UpdateTenantDataResidency_ReturnsOk()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.PutAsJsonAsync($"/api/global/regions/tenants/{tenantId}/data-residency", new { });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetTenantBackups_ReturnsOk()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/global/regions/tenants/{tenantId}/backups");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task CreateTenantBackup_ValidRequest_ReturnsOkOrBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            TenantId = tenantId,
            BackupType = "Full"
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/global/regions/tenants/{tenantId}/backups", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task RestoreTenant_ReturnsOk()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.PostAsJsonAsync($"/api/global/regions/tenants/{tenantId}/restore", new { });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    #endregion

    #region GET /api/global/regions/dr-dashboard Tests

    [Fact]
    public async Task GetDRDashboard_ReturnsOk()
    {
        // Act
        var response = await _client.GetAsync("/api/global/regions/dr-dashboard");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    #endregion
}
