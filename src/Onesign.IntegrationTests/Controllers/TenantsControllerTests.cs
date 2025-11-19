using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Onesign.Data.Contexts;
using Onesign.IntegrationTests.Fixtures;
using Onesign.Modules.Tenants.Application.DTOs;
using Onesign.Modules.Tenants.Domain.Enums;

namespace Onesign.IntegrationTests.Controllers;

public class TenantsControllerTests : IClassFixture<InMemoryWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly InMemoryWebApplicationFactory _factory;

    public TenantsControllerTests(InMemoryWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CreateTenant_ValidRequest_ReturnsCreated()
    {
        // Arrange
        var request = new
        {
            Name = "Test Tenant",
            Slug = "test-tenant-" + Guid.NewGuid().ToString("N")[..8]
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/tenants", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await response.Content.ReadFromJsonAsync<TenantDto>();
        result.Should().NotBeNull();
        result!.Name.Should().Be(request.Name);
        result.Slug.Should().Be(request.Slug);
        result.Status.Should().Be(TenantStatus.Active);
    }

    [Fact]
    public async Task CreateTenant_DuplicateSlug_ReturnsBadRequest()
    {
        // Arrange
        var slug = "duplicate-slug-" + Guid.NewGuid().ToString("N")[..8];
        var request1 = new { Name = "First Tenant", Slug = slug };
        var request2 = new { Name = "Second Tenant", Slug = slug };

        // Act
        await _client.PostAsJsonAsync("/api/tenants", request1);
        var response = await _client.PostAsJsonAsync("/api/tenants", request2);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetTenant_ExistingTenant_ReturnsTenant()
    {
        // Arrange
        var createRequest = new
        {
            Name = "Get Test Tenant",
            Slug = "get-test-" + Guid.NewGuid().ToString("N")[..8]
        };

        var createResponse = await _client.PostAsJsonAsync("/api/tenants", createRequest);
        var created = await createResponse.Content.ReadFromJsonAsync<TenantDto>();

        // Act
        var response = await _client.GetAsync($"/api/tenants/{created!.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await response.Content.ReadFromJsonAsync<TenantDto>();
        result.Should().NotBeNull();
        result!.Id.Should().Be(created.Id);
        result.Name.Should().Be(createRequest.Name);
    }

    [Fact]
    public async Task GetTenant_NonExistentTenant_ReturnsNotFound()
    {
        // Act
        var response = await _client.GetAsync($"/api/tenants/{Guid.NewGuid()}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task UpdateTenantStatus_ValidRequest_ReturnsSuccess()
    {
        // Arrange
        var createRequest = new
        {
            Name = "Status Test Tenant",
            Slug = "status-test-" + Guid.NewGuid().ToString("N")[..8]
        };

        var createResponse = await _client.PostAsJsonAsync("/api/tenants", createRequest);
        var created = await createResponse.Content.ReadFromJsonAsync<TenantDto>();

        var updateRequest = new { Status = (int)TenantStatus.Suspended };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/tenants/{created!.Id}/status", updateRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task ListTenants_ReturnsPagedResult()
    {
        // Arrange - Create multiple tenants
        for (int i = 0; i < 5; i++)
        {
            var request = new
            {
                Name = $"List Test Tenant {i}",
                Slug = $"list-test-{i}-" + Guid.NewGuid().ToString("N")[..8]
            };
            await _client.PostAsJsonAsync("/api/tenants", request);
        }

        // Act
        var response = await _client.GetAsync("/api/tenants?page=1&pageSize=10");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
