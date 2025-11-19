using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Onesign.IntegrationTests.Fixtures;

namespace Onesign.IntegrationTests.Controllers;

public class FederationOidcControllerTests : IClassFixture<InMemoryWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly InMemoryWebApplicationFactory _factory;

    public FederationOidcControllerTests(InMemoryWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    #region GET /api/tenant/federation/oidc Tests

    [Fact]
    public async Task GetProviders_WithTenantId_ReturnsOkOrBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/federation/oidc?tenantId={tenantId}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetProviders_WithoutTenantId_ReturnsBadRequest()
    {
        // Act
        var response = await _client.GetAsync("/api/tenant/federation/oidc");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region POST /api/tenant/federation/oidc Tests

    [Fact]
    public async Task CreateProvider_ValidRequest_ReturnsCreatedOrBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            Name = $"Test OIDC Provider {Guid.NewGuid():N}",
            ProviderType = "Generic",
            Authority = "https://idp.example.com",
            ClientId = "test-client-id",
            ClientSecret = "test-client-secret",
            Scopes = "openid profile email"
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/tenant/federation/oidc?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.Created, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateProvider_EmptyName_ReturnsBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            Name = "",
            ProviderType = "Generic",
            Authority = "https://idp.example.com",
            ClientId = "test-client-id",
            ClientSecret = "test-client-secret",
            Scopes = "openid profile email"
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/tenant/federation/oidc?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateProvider_EmptyAuthority_ReturnsBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            Name = "Test Provider",
            ProviderType = "Generic",
            Authority = "",
            ClientId = "test-client-id",
            ClientSecret = "test-client-secret",
            Scopes = "openid profile email"
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/tenant/federation/oidc?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateProvider_EmptyClientId_ReturnsBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            Name = "Test Provider",
            ProviderType = "Generic",
            Authority = "https://idp.example.com",
            ClientId = "",
            ClientSecret = "test-client-secret",
            Scopes = "openid profile email"
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/tenant/federation/oidc?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateProvider_WithoutTenantId_ReturnsBadRequest()
    {
        // Arrange
        var request = new
        {
            Name = "Test Provider",
            ProviderType = "Generic",
            Authority = "https://idp.example.com",
            ClientId = "test-client-id",
            ClientSecret = "test-client-secret",
            Scopes = "openid profile email"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/tenant/federation/oidc", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateProvider_InvalidProviderType_ReturnsBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            Name = "Test Provider",
            ProviderType = "InvalidType",
            Authority = "https://idp.example.com",
            ClientId = "test-client-id",
            ClientSecret = "test-client-secret",
            Scopes = "openid profile email"
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/tenant/federation/oidc?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateProvider_AzureAD_ReturnsCreatedOrBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            Name = "Azure AD Provider",
            ProviderType = "AzureAD",
            Authority = "https://login.microsoftonline.com/tenant-id/v2.0",
            ClientId = "azure-client-id",
            ClientSecret = "azure-client-secret",
            Scopes = "openid profile email"
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/tenant/federation/oidc?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.Created, HttpStatusCode.BadRequest);
    }

    #endregion
}
