using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Onesign.IntegrationTests.Fixtures;

namespace Onesign.IntegrationTests.Controllers;

public class OrgUnitsControllerTests : IClassFixture<InMemoryWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly InMemoryWebApplicationFactory _factory;

    public OrgUnitsControllerTests(InMemoryWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    #region GET /api/tenant/org-units/tree Tests

    [Fact]
    public async Task GetTree_WithTenantId_ReturnsOkOrBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/org-units/tree?tenantId={tenantId}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetTree_WithoutTenantId_ReturnsBadRequest()
    {
        // Act
        var response = await _client.GetAsync("/api/tenant/org-units/tree");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region GET /api/tenant/org-units/{orgUnitId} Tests

    [Fact]
    public async Task GetDetails_WithTenantId_ReturnsOkOrBadRequest()
    {
        // Arrange
        var orgUnitId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/org-units/{orgUnitId}?tenantId={tenantId}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetDetails_WithoutTenantId_ReturnsBadRequest()
    {
        // Arrange
        var orgUnitId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/org-units/{orgUnitId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region POST /api/tenant/org-units Tests

    [Fact]
    public async Task Create_ValidRequest_ReturnsOkOrBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            Name = $"Test Org Unit {Guid.NewGuid():N}",
            Code = $"OU-{Guid.NewGuid():N}".Substring(0, 20),
            ParentId = (Guid?)null,
            SortOrder = 1
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/tenant/org-units?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Create_EmptyName_ReturnsBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            Name = "",
            Code = "TEST",
            ParentId = (Guid?)null,
            SortOrder = 1
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/tenant/org-units?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Create_WithParent_ReturnsOkOrBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var parentId = Guid.NewGuid();
        var request = new
        {
            Name = "Child Org Unit",
            Code = "CHILD",
            ParentId = parentId,
            SortOrder = 1
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/tenant/org-units?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Create_WithoutTenantId_ReturnsBadRequest()
    {
        // Arrange
        var request = new
        {
            Name = "Test Org Unit",
            Code = "TEST",
            ParentId = (Guid?)null,
            SortOrder = 1
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/tenant/org-units", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region PUT /api/tenant/org-units/{orgUnitId} Tests

    [Fact]
    public async Task Update_ValidRequest_ReturnsOkOrBadRequest()
    {
        // Arrange
        var orgUnitId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var request = new
        {
            Name = "Updated Org Unit",
            SortOrder = 2
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/tenant/org-units/{orgUnitId}?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Update_EmptyName_ReturnsBadRequest()
    {
        // Arrange
        var orgUnitId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var request = new
        {
            Name = "",
            SortOrder = 2
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/tenant/org-units/{orgUnitId}?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region POST /api/tenant/org-units/{orgUnitId}/move Tests

    [Fact]
    public async Task Move_ValidRequest_ReturnsNoContentOrBadRequest()
    {
        // Arrange
        var orgUnitId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var request = new
        {
            NewParentId = Guid.NewGuid()
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/tenant/org-units/{orgUnitId}/move?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.NoContent, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Move_ToRoot_ReturnsNoContentOrBadRequest()
    {
        // Arrange
        var orgUnitId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var request = new
        {
            NewParentId = (Guid?)null
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/tenant/org-units/{orgUnitId}/move?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.NoContent, HttpStatusCode.BadRequest);
    }

    #endregion

    #region DELETE /api/tenant/org-units/{orgUnitId} Tests

    [Fact]
    public async Task Delete_ReturnsNoContentOrBadRequest()
    {
        // Arrange
        var orgUnitId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.DeleteAsync($"/api/tenant/org-units/{orgUnitId}?tenantId={tenantId}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.NoContent, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Delete_WithoutTenantId_ReturnsBadRequest()
    {
        // Arrange
        var orgUnitId = Guid.NewGuid();

        // Act
        var response = await _client.DeleteAsync($"/api/tenant/org-units/{orgUnitId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion
}
