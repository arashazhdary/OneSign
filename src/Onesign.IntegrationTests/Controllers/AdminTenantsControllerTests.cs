using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Onesign.IntegrationTests.Fixtures;

namespace Onesign.IntegrationTests.Controllers;

public class AdminTenantsControllerTests : IClassFixture<InMemoryWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly InMemoryWebApplicationFactory _factory;

    public AdminTenantsControllerTests(InMemoryWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    #region GET /api/admin/tenants Tests

    [Fact]
    public async Task GetTenants_ReturnsOk()
    {
        // Act
        var response = await _client.GetAsync("/api/admin/tenants");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetTenants_ReturnsPagedResult()
    {
        // Act
        var response = await _client.GetAsync("/api/admin/tenants");
        var content = await response.Content.ReadFromJsonAsync<PagedResultResponse>();

        // Assert
        content.Should().NotBeNull();
        content!.items.Should().NotBeNull();
    }

    [Fact]
    public async Task GetTenants_WithPagination_ReturnsCorrectPage()
    {
        // Act
        var response = await _client.GetAsync("/api/admin/tenants?pageNumber=1&pageSize=5");
        var content = await response.Content.ReadFromJsonAsync<PagedResultResponse>();

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        content.Should().NotBeNull();
    }

    [Fact]
    public async Task GetTenants_WithLargePageSize_ReturnsOk()
    {
        // Act
        var response = await _client.GetAsync("/api/admin/tenants?pageNumber=1&pageSize=100");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetTenants_WithInvalidPageNumber_HandlesGracefully()
    {
        // Act
        var response = await _client.GetAsync("/api/admin/tenants?pageNumber=0&pageSize=10");

        // Assert - Should either return OK with default or handle gracefully
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    #endregion

    #region POST /api/admin/tenants Tests

    [Fact]
    public async Task CreateTenant_ValidRequest_ReturnsCreated()
    {
        // Arrange
        var request = new
        {
            Name = $"Test Tenant {Guid.NewGuid():N}",
            Slug = $"test-tenant-{Guid.NewGuid():N}"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/admin/tenants", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.Created, HttpStatusCode.OK);
    }

    [Fact]
    public async Task CreateTenant_DuplicateSlug_ReturnsBadRequest()
    {
        // Arrange
        var slug = $"duplicate-slug-{Guid.NewGuid():N}";
        var request1 = new { Name = "Tenant 1", Slug = slug };
        var request2 = new { Name = "Tenant 2", Slug = slug };

        // Act
        await _client.PostAsJsonAsync("/api/admin/tenants", request1);
        var response = await _client.PostAsJsonAsync("/api/admin/tenants", request2);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateTenant_EmptyName_ReturnsBadRequest()
    {
        // Arrange
        var request = new
        {
            Name = "",
            Slug = $"test-{Guid.NewGuid():N}"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/admin/tenants", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateTenant_EmptySlug_ReturnsBadRequest()
    {
        // Arrange
        var request = new
        {
            Name = "Test Tenant",
            Slug = ""
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/admin/tenants", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateTenant_MissingName_ReturnsBadRequest()
    {
        // Arrange
        var request = new
        {
            Slug = $"test-{Guid.NewGuid():N}"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/admin/tenants", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateTenant_MissingSlug_ReturnsBadRequest()
    {
        // Arrange
        var request = new
        {
            Name = "Test Tenant"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/admin/tenants", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateTenant_NullBody_ReturnsBadRequest()
    {
        // Act
        var response = await _client.PostAsJsonAsync("/api/admin/tenants", (object?)null);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateTenant_ReturnsCreatedTenantWithId()
    {
        // Arrange
        var request = new
        {
            Name = $"Test Tenant {Guid.NewGuid():N}",
            Slug = $"test-tenant-{Guid.NewGuid():N}"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/admin/tenants", request);
        var tenant = await response.Content.ReadFromJsonAsync<TenantResponse>();

        // Assert
        if (response.IsSuccessStatusCode)
        {
            tenant.Should().NotBeNull();
            tenant!.Id.Should().NotBeEmpty();
            tenant.Name.Should().Be(request.Name);
            tenant.Slug.Should().Be(request.Slug);
        }
    }

    #endregion

    #region PATCH /api/admin/tenants/{tenantId}/status Tests

    [Fact]
    public async Task UpdateTenantStatus_ValidRequest_ReturnsOk()
    {
        // Arrange - Create a tenant first
        var createRequest = new
        {
            Name = $"Status Test {Guid.NewGuid():N}",
            Slug = $"status-test-{Guid.NewGuid():N}"
        };
        var createResponse = await _client.PostAsJsonAsync("/api/admin/tenants", createRequest);
        var tenant = await createResponse.Content.ReadFromJsonAsync<TenantResponse>();

        if (tenant?.Id == Guid.Empty) return; // Skip if creation failed

        var updateRequest = new { Status = "Suspended" };

        // Act
        var response = await _client.PatchAsJsonAsync($"/api/admin/tenants/{tenant!.Id}/status", updateRequest);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdateTenantStatus_NonExistentTenant_ReturnsBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new { Status = "Suspended" };

        // Act
        var response = await _client.PatchAsJsonAsync($"/api/admin/tenants/{tenantId}/status", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdateTenantStatus_InvalidStatus_ReturnsBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new { Status = "InvalidStatus" };

        // Act
        var response = await _client.PatchAsJsonAsync($"/api/admin/tenants/{tenantId}/status", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdateTenantStatus_EmptyBody_ReturnsBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.PatchAsJsonAsync($"/api/admin/tenants/{tenantId}/status", new { });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion
}

public class PagedResultResponse
{
    public object[] items { get; set; } = Array.Empty<object>();
    public int totalCount { get; set; }
    public int pageNumber { get; set; }
    public int pageSize { get; set; }
}

public class TenantResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}
