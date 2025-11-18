using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Onesign.IntegrationTests.Fixtures;

namespace Onesign.IntegrationTests.Controllers;

public class FederationScimControllerTests : IClassFixture<InMemoryWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly InMemoryWebApplicationFactory _factory;

    public FederationScimControllerTests(InMemoryWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    #region GET /api/tenant/federation/scim/tokens Tests

    [Fact]
    public async Task GetTokens_WithTenantId_ReturnsOkOrBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/federation/scim/tokens?tenantId={tenantId}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetTokens_WithoutTenantId_ReturnsBadRequest()
    {
        // Act
        var response = await _client.GetAsync("/api/tenant/federation/scim/tokens");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region POST /api/tenant/federation/scim/tokens Tests

    [Fact]
    public async Task CreateToken_ValidRequest_ReturnsCreatedOrBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            Name = $"Test SCIM Token {Guid.NewGuid():N}",
            ExpiresAt = DateTime.UtcNow.AddYears(1)
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/tenant/federation/scim/tokens?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.Created, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateToken_EmptyName_ReturnsBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            Name = "",
            ExpiresAt = DateTime.UtcNow.AddYears(1)
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/tenant/federation/scim/tokens?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateToken_WithoutExpiration_ReturnsCreatedOrBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            Name = $"No Expiry Token {Guid.NewGuid():N}",
            ExpiresAt = (DateTime?)null
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/tenant/federation/scim/tokens?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.Created, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateToken_PastExpiration_ReturnsBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            Name = "Expired Token",
            ExpiresAt = DateTime.UtcNow.AddDays(-1)
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/tenant/federation/scim/tokens?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateToken_WithoutTenantId_ReturnsBadRequest()
    {
        // Arrange
        var request = new
        {
            Name = "Test Token",
            ExpiresAt = DateTime.UtcNow.AddYears(1)
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/tenant/federation/scim/tokens", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateToken_LongExpiration_ReturnsCreatedOrBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            Name = "Long-lived Token",
            ExpiresAt = DateTime.UtcNow.AddYears(10)
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/tenant/federation/scim/tokens?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.Created, HttpStatusCode.BadRequest);
    }

    #endregion
}
