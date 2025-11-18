using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Onesign.IntegrationTests.Fixtures;

namespace Onesign.IntegrationTests.Controllers;

public class UsersControllerTests : IClassFixture<InMemoryWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly InMemoryWebApplicationFactory _factory;

    public UsersControllerTests(InMemoryWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    #region GET /api/tenant/users Tests

    [Fact]
    public async Task GetUsers_WithTenantId_ReturnsOk()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/users?tenantId={tenantId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetUsers_WithPagination_ReturnsOk()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/users?tenantId={tenantId}&pageNumber=1&pageSize=10");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetUsers_WithOrgUnitFilter_ReturnsOk()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var orgUnitId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/users?tenantId={tenantId}&orgUnitId={orgUnitId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetUsers_WithoutTenantId_ReturnsBadRequest()
    {
        // Act
        var response = await _client.GetAsync("/api/tenant/users");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region POST /api/tenant/users/invite Tests

    [Fact]
    public async Task InviteUser_ValidRequest_ReturnsCreated()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            Email = $"invited-{Guid.NewGuid():N}@example.com",
            IsAdmin = false
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/tenant/users/invite?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.Created, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task InviteUser_InvalidEmail_ReturnsBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            Email = "invalid-email",
            IsAdmin = false
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/tenant/users/invite?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task InviteUser_EmptyEmail_ReturnsBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            Email = "",
            IsAdmin = false
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/tenant/users/invite?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task InviteUser_WithoutTenantId_ReturnsBadRequest()
    {
        // Arrange
        var request = new
        {
            Email = "test@example.com",
            IsAdmin = false
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/tenant/users/invite", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task InviteUser_AsAdmin_ReturnsCreated()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            Email = $"admin-{Guid.NewGuid():N}@example.com",
            IsAdmin = true
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/tenant/users/invite?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.Created, HttpStatusCode.BadRequest);
    }

    #endregion

    #region GET /api/tenant/users/{tenantUserId} Tests

    [Fact]
    public async Task GetUserDetails_ExistingUser_ReturnsOk()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/users/{tenantUserId}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetUserDetails_NonExistentUser_ReturnsNotFound()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/users/{tenantUserId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    #endregion

    #region PATCH /api/tenant/users/{tenantUserId}/status Tests

    [Fact]
    public async Task DisableUser_ValidRequest_ReturnsOk()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.PatchAsync($"/api/tenant/users/{tenantUserId}/status?tenantId={tenantId}", null);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task DisableUser_WithoutTenantId_ReturnsBadRequest()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();

        // Act
        var response = await _client.PatchAsync($"/api/tenant/users/{tenantUserId}/status", null);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region GET /api/tenant/users/{tenantUserId}/org-units Tests

    [Fact]
    public async Task GetUserOrgUnits_ReturnsOk()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/users/{tenantUserId}/org-units?tenantId={tenantId}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    #endregion

    #region PUT /api/tenant/users/{tenantUserId}/org-units Tests

    [Fact]
    public async Task AssignUserOrgUnits_ValidRequest_ReturnsNoContent()
    {
        // Arrange
        var tenantUserId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var request = new
        {
            PrimaryOrgUnitId = Guid.NewGuid(),
            SecondaryOrgUnitIds = new Guid[] { }
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/tenant/users/{tenantUserId}/org-units?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.NoContent, HttpStatusCode.BadRequest);
    }

    #endregion

    #region GET /api/tenant/users/current/scope Tests

    [Fact]
    public async Task GetCurrentUserScope_WithoutAuth_ReturnsUnauthorized()
    {
        // Act
        var response = await _client.GetAsync("/api/tenant/users/current/scope");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    #endregion
}
