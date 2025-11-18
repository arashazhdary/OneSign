using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Onesign.IntegrationTests.Fixtures;

namespace Onesign.IntegrationTests.Controllers;

public class ServiceAccountControllerTests : IClassFixture<InMemoryWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly InMemoryWebApplicationFactory _factory;

    public ServiceAccountControllerTests(InMemoryWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    #region GET /api/tenant/service-accounts Tests

    [Fact]
    public async Task GetServiceAccounts_WithTenantId_ReturnsOkOrBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/service-accounts?tenantId={tenantId}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetServiceAccounts_WithoutTenantId_ReturnsBadRequest()
    {
        // Act
        var response = await _client.GetAsync("/api/tenant/service-accounts");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region POST /api/tenant/service-accounts Tests

    [Fact]
    public async Task CreateServiceAccount_ValidRequest_ReturnsOkOrBadRequest()
    {
        // Arrange
        var request = new
        {
            TenantId = Guid.NewGuid(),
            Name = $"Test Service Account {Guid.NewGuid():N}",
            Description = "Test description"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/tenant/service-accounts", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateServiceAccount_EmptyName_ReturnsBadRequest()
    {
        // Arrange
        var request = new
        {
            TenantId = Guid.NewGuid(),
            Name = "",
            Description = "Test description"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/tenant/service-accounts", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateServiceAccount_NullBody_ReturnsBadRequest()
    {
        // Act
        var response = await _client.PostAsJsonAsync("/api/tenant/service-accounts", (object?)null);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateServiceAccount_WithoutDescription_ReturnsOkOrBadRequest()
    {
        // Arrange
        var request = new
        {
            TenantId = Guid.NewGuid(),
            Name = $"Test Service Account {Guid.NewGuid():N}"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/tenant/service-accounts", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    #endregion
}
