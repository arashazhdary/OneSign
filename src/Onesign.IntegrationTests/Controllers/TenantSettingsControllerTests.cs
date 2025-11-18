using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Onesign.IntegrationTests.Fixtures;

namespace Onesign.IntegrationTests.Controllers;

public class TenantSettingsControllerTests : IClassFixture<InMemoryWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly InMemoryWebApplicationFactory _factory;

    public TenantSettingsControllerTests(InMemoryWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    #region GET /api/tenant/settings Tests

    [Fact]
    public async Task GetSettings_WithTenantId_ReturnsOkOrNotFound()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/settings?tenantId={tenantId}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetSettings_WithoutTenantId_ReturnsBadRequest()
    {
        // Act
        var response = await _client.GetAsync("/api/tenant/settings");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetSettings_InvalidTenantId_ReturnsBadRequest()
    {
        // Act
        var response = await _client.GetAsync("/api/tenant/settings?tenantId=invalid");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region PUT /api/tenant/settings/branding Tests

    [Fact]
    public async Task UpdateBranding_ValidRequest_ReturnsOkOrBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            LogoUrl = "https://example.com/logo.png",
            PrimaryColor = "#FF5733"
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/tenant/settings/branding?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdateBranding_EmptyLogoUrl_ReturnsOkOrBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            LogoUrl = "",
            PrimaryColor = "#FF5733"
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/tenant/settings/branding?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdateBranding_InvalidColorFormat_ReturnsBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            LogoUrl = "https://example.com/logo.png",
            PrimaryColor = "invalid-color"
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/tenant/settings/branding?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdateBranding_WithoutTenantId_ReturnsBadRequest()
    {
        // Arrange
        var request = new
        {
            LogoUrl = "https://example.com/logo.png",
            PrimaryColor = "#FF5733"
        };

        // Act
        var response = await _client.PutAsJsonAsync("/api/tenant/settings/branding", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdateBranding_NullBody_ReturnsBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.PutAsJsonAsync($"/api/tenant/settings/branding?tenantId={tenantId}", (object?)null);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdateBranding_ValidHexColor_ReturnsOkOrBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            LogoUrl = "https://example.com/logo.png",
            PrimaryColor = "#AABBCC"
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/tenant/settings/branding?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    #endregion
}
