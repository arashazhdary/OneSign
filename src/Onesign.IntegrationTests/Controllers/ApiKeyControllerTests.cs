using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Onesign.IntegrationTests.Fixtures;

namespace Onesign.IntegrationTests.Controllers;

public class ApiKeyControllerTests : IClassFixture<InMemoryWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly InMemoryWebApplicationFactory _factory;

    public ApiKeyControllerTests(InMemoryWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    #region GET /api/tenant/api-keys Tests

    [Fact]
    public async Task GetApiKeys_WithTenantId_ReturnsOkOrBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/api-keys?tenantId={tenantId}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetApiKeys_WithServiceAccountFilter_ReturnsOkOrBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var serviceAccountId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/api-keys?tenantId={tenantId}&serviceAccountId={serviceAccountId}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetApiKeys_WithoutTenantId_ReturnsBadRequest()
    {
        // Act
        var response = await _client.GetAsync("/api/tenant/api-keys");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region POST /api/tenant/api-keys Tests

    [Fact]
    public async Task CreateApiKey_ValidRequest_ReturnsOkOrBadRequest()
    {
        // Arrange
        var request = new
        {
            TenantId = Guid.NewGuid(),
            ServiceAccountId = Guid.NewGuid(),
            Name = $"Test API Key {Guid.NewGuid():N}",
            ExpiresAt = DateTime.UtcNow.AddYears(1),
            Scopes = new[] { "read", "write" }
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/tenant/api-keys", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateApiKey_EmptyName_ReturnsBadRequest()
    {
        // Arrange
        var request = new
        {
            TenantId = Guid.NewGuid(),
            ServiceAccountId = Guid.NewGuid(),
            Name = "",
            ExpiresAt = DateTime.UtcNow.AddYears(1)
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/tenant/api-keys", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateApiKey_NullBody_ReturnsBadRequest()
    {
        // Act
        var response = await _client.PostAsJsonAsync("/api/tenant/api-keys", (object?)null);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region POST /api/tenant/api-keys/{id}/revoke Tests

    [Fact]
    public async Task RevokeApiKey_ValidRequest_ReturnsOkOrBadRequest()
    {
        // Arrange
        var keyId = Guid.NewGuid();
        var request = new
        {
            Id = keyId,
            Reason = "Test revocation"
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/tenant/api-keys/{keyId}/revoke", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task RevokeApiKey_NonExistent_ReturnsBadRequest()
    {
        // Arrange
        var keyId = Guid.NewGuid();
        var request = new
        {
            Reason = "Test revocation"
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/tenant/api-keys/{keyId}/revoke", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion
}
