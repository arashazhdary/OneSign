using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Onesign.IntegrationTests.Fixtures;
using Onesign.Modules.Applications.Application.DTOs;

namespace Onesign.IntegrationTests.Controllers;

public class ApplicationsControllerTests : IClassFixture<InMemoryWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly InMemoryWebApplicationFactory _factory;

    public ApplicationsControllerTests(InMemoryWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CreateApplication_ValidRequest_ReturnsCreated()
    {
        // Arrange
        // First create a tenant
        var tenantRequest = new
        {
            Name = "App Test Tenant",
            Slug = "app-test-" + Guid.NewGuid().ToString("N")[..8]
        };
        var tenantResponse = await _client.PostAsJsonAsync("/api/tenants", tenantRequest);
        var tenant = await tenantResponse.Content.ReadFromJsonAsync<dynamic>();
        var tenantId = (Guid)tenant!.id;

        var request = new
        {
            TenantId = tenantId,
            Name = "Test Application",
            ApplicationType = "web",
            RedirectUris = new[] { "https://example.com/callback" }
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/applications", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await response.Content.ReadFromJsonAsync<ApplicationClientDto>();
        result.Should().NotBeNull();
        result!.Name.Should().Be(request.Name);
        result.ApplicationType.Should().Be(request.ApplicationType);
    }

    [Fact]
    public async Task GetApplication_ExistingApplication_ReturnsApplication()
    {
        // Arrange
        var tenantRequest = new
        {
            Name = "Get App Test Tenant",
            Slug = "get-app-test-" + Guid.NewGuid().ToString("N")[..8]
        };
        var tenantResponse = await _client.PostAsJsonAsync("/api/tenants", tenantRequest);
        var tenant = await tenantResponse.Content.ReadFromJsonAsync<dynamic>();
        var tenantId = (Guid)tenant!.id;

        var createRequest = new
        {
            TenantId = tenantId,
            Name = "Get Test Application",
            ApplicationType = "web",
            RedirectUris = new[] { "https://example.com/callback" }
        };

        var createResponse = await _client.PostAsJsonAsync("/api/applications", createRequest);
        var created = await createResponse.Content.ReadFromJsonAsync<ApplicationClientDto>();

        // Act
        var response = await _client.GetAsync($"/api/applications/{created!.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await response.Content.ReadFromJsonAsync<ApplicationClientDto>();
        result.Should().NotBeNull();
        result!.Id.Should().Be(created.Id);
    }

    [Fact]
    public async Task AddRedirectUri_ValidRequest_ReturnsSuccess()
    {
        // Arrange
        var tenantRequest = new
        {
            Name = "Redirect Test Tenant",
            Slug = "redirect-test-" + Guid.NewGuid().ToString("N")[..8]
        };
        var tenantResponse = await _client.PostAsJsonAsync("/api/tenants", tenantRequest);
        var tenant = await tenantResponse.Content.ReadFromJsonAsync<dynamic>();
        var tenantId = (Guid)tenant!.id;

        var createRequest = new
        {
            TenantId = tenantId,
            Name = "Redirect Test Application",
            ApplicationType = "web",
            RedirectUris = new[] { "https://example.com/callback" }
        };

        var createResponse = await _client.PostAsJsonAsync("/api/applications", createRequest);
        var created = await createResponse.Content.ReadFromJsonAsync<ApplicationClientDto>();

        var addRedirectRequest = new
        {
            Uri = "https://example.com/new-callback"
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/applications/{created!.Id}/redirect-uris", addRedirectRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task RegenerateClientSecret_ValidRequest_ReturnsNewSecret()
    {
        // Arrange
        var tenantRequest = new
        {
            Name = "Regen Secret Tenant",
            Slug = "regen-secret-" + Guid.NewGuid().ToString("N")[..8]
        };
        var tenantResponse = await _client.PostAsJsonAsync("/api/tenants", tenantRequest);
        var tenant = await tenantResponse.Content.ReadFromJsonAsync<dynamic>();
        var tenantId = (Guid)tenant!.id;

        var createRequest = new
        {
            TenantId = tenantId,
            Name = "Regen Secret Application",
            ApplicationType = "web",
            RedirectUris = new[] { "https://example.com/callback" }
        };

        var createResponse = await _client.PostAsJsonAsync("/api/applications", createRequest);
        var created = await createResponse.Content.ReadFromJsonAsync<ApplicationClientDto>();

        // Act
        var response = await _client.PostAsync($"/api/applications/{created!.Id}/regenerate-secret", null);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
