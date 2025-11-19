using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Onesign.IntegrationTests.Fixtures;

namespace Onesign.IntegrationTests.Controllers;

public class GlobalCryptoControllerTests : IClassFixture<InMemoryWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly InMemoryWebApplicationFactory _factory;

    public GlobalCryptoControllerTests(InMemoryWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    #region GET /api/global/crypto/keysets Tests

    [Fact]
    public async Task GetKeySets_ReturnsOk()
    {
        // Act
        var response = await _client.GetAsync("/api/global/crypto/keysets");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    #endregion

    #region GET /api/global/crypto/keysets/{id} Tests

    [Fact]
    public async Task GetKeySet_NonExistent_ReturnsNotFound()
    {
        // Arrange
        var keySetId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/global/crypto/keysets/{keySetId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetKeySet_InvalidGuid_ReturnsBadRequest()
    {
        // Act
        var response = await _client.GetAsync("/api/global/crypto/keysets/invalid-guid");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.BadRequest, HttpStatusCode.NotFound);
    }

    #endregion

    #region POST /api/global/crypto/keysets/{id}/rollover Tests

    [Fact]
    public async Task Rollover_NonExistent_ReturnsBadRequest()
    {
        // Arrange
        var keySetId = Guid.NewGuid();

        // Act
        var response = await _client.PostAsync($"/api/global/crypto/keysets/{keySetId}/rollover", null);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Rollover_ValidRequest_ReturnsOkOrBadRequest()
    {
        // Arrange
        var keySetId = Guid.NewGuid();

        // Act
        var response = await _client.PostAsync($"/api/global/crypto/keysets/{keySetId}/rollover", null);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    #endregion

    #region POST /api/global/crypto/keyversions/{id}/revoke Tests

    [Fact]
    public async Task Revoke_NonExistent_ReturnsBadRequest()
    {
        // Arrange
        var keyVersionId = Guid.NewGuid();

        // Act
        var response = await _client.PostAsync($"/api/global/crypto/keyversions/{keyVersionId}/revoke", null);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Revoke_WithAutoCreateNew_ReturnsOkOrBadRequest()
    {
        // Arrange
        var keyVersionId = Guid.NewGuid();

        // Act
        var response = await _client.PostAsync($"/api/global/crypto/keyversions/{keyVersionId}/revoke?autoCreateNew=true", null);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Revoke_WithoutAutoCreateNew_ReturnsOkOrBadRequest()
    {
        // Arrange
        var keyVersionId = Guid.NewGuid();

        // Act
        var response = await _client.PostAsync($"/api/global/crypto/keyversions/{keyVersionId}/revoke?autoCreateNew=false", null);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    #endregion

    #region GET /api/global/crypto/rotation-policies Tests

    [Fact]
    public async Task GetRotationPolicies_ReturnsOk()
    {
        // Act
        var response = await _client.GetAsync("/api/global/crypto/rotation-policies");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    #endregion
}
