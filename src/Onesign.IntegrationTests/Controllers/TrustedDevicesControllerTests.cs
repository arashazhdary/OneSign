using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Onesign.IntegrationTests.Fixtures;

namespace Onesign.IntegrationTests.Controllers;

public class TrustedDevicesControllerTests : IClassFixture<InMemoryWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly InMemoryWebApplicationFactory _factory;

    public TrustedDevicesControllerTests(InMemoryWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    #region GET /api/tenant/trusted-devices Tests

    [Fact]
    public async Task GetDevices_WithUserId_ReturnsOk()
    {
        // Arrange
        var userId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/trusted-devices?userId={userId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetDevices_WithoutUserId_ReturnsBadRequest()
    {
        // Act
        var response = await _client.GetAsync("/api/tenant/trusted-devices");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetDevices_InvalidUserId_ReturnsBadRequest()
    {
        // Act
        var response = await _client.GetAsync("/api/tenant/trusted-devices?userId=invalid-guid");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region GET /api/tenant/trusted-devices/check Tests

    [Fact]
    public async Task CheckTrustedDevice_ValidRequest_ReturnsOk()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var deviceFingerprint = "test-fingerprint-123";

        // Act
        var response = await _client.GetAsync($"/api/tenant/trusted-devices/check?userId={userId}&deviceFingerprint={deviceFingerprint}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task CheckTrustedDevice_WithoutUserId_ReturnsBadRequest()
    {
        // Arrange
        var deviceFingerprint = "test-fingerprint-123";

        // Act
        var response = await _client.GetAsync($"/api/tenant/trusted-devices/check?deviceFingerprint={deviceFingerprint}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CheckTrustedDevice_WithoutFingerprint_ReturnsBadRequest()
    {
        // Arrange
        var userId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/trusted-devices/check?userId={userId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CheckTrustedDevice_EmptyFingerprint_ReturnsBadRequest()
    {
        // Arrange
        var userId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/trusted-devices/check?userId={userId}&deviceFingerprint=");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CheckTrustedDevice_ReturnsExpectedResponse()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var deviceFingerprint = "test-fingerprint-123";

        // Act
        var response = await _client.GetAsync($"/api/tenant/trusted-devices/check?userId={userId}&deviceFingerprint={deviceFingerprint}");
        var content = await response.Content.ReadFromJsonAsync<TrustedDeviceCheckResponse>();

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        content.Should().NotBeNull();
    }

    #endregion
}

public class TrustedDeviceCheckResponse
{
    public bool trusted { get; set; }
}
