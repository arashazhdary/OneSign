using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Onesign.IntegrationTests.Fixtures;

namespace Onesign.IntegrationTests.Controllers;

public class ApplicationsControllerFullTests : IClassFixture<InMemoryWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly InMemoryWebApplicationFactory _factory;

    public ApplicationsControllerFullTests(InMemoryWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    #region GET /api/tenant/applications Tests

    [Fact]
    public async Task GetApplications_WithTenantId_ReturnsOk()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/applications?tenantId={tenantId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetApplications_WithPagination_ReturnsOk()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/applications?tenantId={tenantId}&pageNumber=1&pageSize=20");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetApplications_WithOrgUnitFilter_ReturnsOk()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var orgUnitId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/applications?tenantId={tenantId}&orgUnitId={orgUnitId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetApplications_WithoutTenantId_ReturnsBadRequest()
    {
        // Act
        var response = await _client.GetAsync("/api/tenant/applications");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region POST /api/tenant/applications Tests

    [Fact]
    public async Task CreateApplication_ValidRequest_ReturnsCreatedOrBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            Name = $"Test App {Guid.NewGuid():N}",
            ApplicationType = "web",
            GrantType = "authorization_code",
            RedirectUris = new[] { "https://example.com/callback" }
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/tenant/applications?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.Created, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateApplication_EmptyName_ReturnsBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            Name = "",
            ApplicationType = "web",
            GrantType = "authorization_code",
            RedirectUris = new[] { "https://example.com/callback" }
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/tenant/applications?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateApplication_InvalidApplicationType_ReturnsBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            Name = "Test App",
            ApplicationType = "invalid",
            GrantType = "authorization_code",
            RedirectUris = new[] { "https://example.com/callback" }
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/tenant/applications?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateApplication_WithoutTenantId_ReturnsBadRequest()
    {
        // Arrange
        var request = new
        {
            Name = "Test App",
            ApplicationType = "web",
            GrantType = "authorization_code"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/tenant/applications", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region GET /api/tenant/applications/{id} Tests

    [Fact]
    public async Task GetApplicationDetails_NonExistent_ReturnsNotFound()
    {
        // Arrange
        var appId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/applications/{appId}?tenantId={tenantId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetApplicationDetails_WithoutTenantId_ReturnsBadRequest()
    {
        // Arrange
        var appId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/applications/{appId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region PUT /api/tenant/applications/{id} Tests

    [Fact]
    public async Task UpdateApplication_ValidRequest_ReturnsOkOrBadRequest()
    {
        // Arrange
        var appId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var request = new
        {
            Name = "Updated App",
            ApplicationType = "web",
            GrantType = "authorization_code"
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/tenant/applications/{appId}?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdateApplication_EmptyName_ReturnsBadRequest()
    {
        // Arrange
        var appId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var request = new
        {
            Name = "",
            ApplicationType = "web",
            GrantType = "authorization_code"
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/tenant/applications/{appId}?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region DELETE /api/tenant/applications/{id} Tests

    [Fact]
    public async Task DeleteApplication_ReturnsNoContentOrBadRequest()
    {
        // Arrange
        var appId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.DeleteAsync($"/api/tenant/applications/{appId}?tenantId={tenantId}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.NoContent, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task DeleteApplication_WithoutTenantId_ReturnsBadRequest()
    {
        // Arrange
        var appId = Guid.NewGuid();

        // Act
        var response = await _client.DeleteAsync($"/api/tenant/applications/{appId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region POST /api/tenant/applications/{id}/redirect-uris Tests

    [Fact]
    public async Task AddRedirectUri_ValidRequest_ReturnsOkOrBadRequest()
    {
        // Arrange
        var appId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var request = new
        {
            Uri = "https://example.com/callback2"
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/tenant/applications/{appId}/redirect-uris?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task AddRedirectUri_InvalidUri_ReturnsBadRequest()
    {
        // Arrange
        var appId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var request = new
        {
            Uri = "invalid-uri"
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/tenant/applications/{appId}/redirect-uris?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region DELETE /api/tenant/applications/redirect-uris/{redirectUriId} Tests

    [Fact]
    public async Task RemoveRedirectUri_ReturnsNoContentOrBadRequest()
    {
        // Arrange
        var redirectUriId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.DeleteAsync($"/api/tenant/applications/redirect-uris/{redirectUriId}?tenantId={tenantId}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.NoContent, HttpStatusCode.BadRequest);
    }

    #endregion

    #region POST /api/tenant/applications/{id}/secrets Tests

    [Fact]
    public async Task AddClientSecret_ValidRequest_ReturnsOkOrBadRequest()
    {
        // Arrange
        var appId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var request = new
        {
            ExpiresAt = DateTime.UtcNow.AddYears(1)
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/tenant/applications/{appId}/secrets?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task AddClientSecret_PastExpiration_ReturnsBadRequest()
    {
        // Arrange
        var appId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var request = new
        {
            ExpiresAt = DateTime.UtcNow.AddDays(-1)
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/tenant/applications/{appId}/secrets?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region DELETE /api/tenant/applications/secrets/{secretId} Tests

    [Fact]
    public async Task RemoveClientSecret_ReturnsNoContentOrBadRequest()
    {
        // Arrange
        var secretId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.DeleteAsync($"/api/tenant/applications/secrets/{secretId}?tenantId={tenantId}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.NoContent, HttpStatusCode.BadRequest);
    }

    #endregion

    #region Org Units Assignment Tests

    [Fact]
    public async Task GetApplicationOrgUnits_ReturnsOkOrBadRequest()
    {
        // Arrange
        var appId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/applications/{appId}/org-units?tenantId={tenantId}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task AssignApplicationOrgUnits_ValidRequest_ReturnsNoContentOrBadRequest()
    {
        // Arrange
        var appId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var request = new
        {
            OrgUnitIds = new[] { Guid.NewGuid(), Guid.NewGuid() }
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/tenant/applications/{appId}/org-units?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.NoContent, HttpStatusCode.BadRequest);
    }

    #endregion
}
