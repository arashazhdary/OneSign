using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Onesign.IntegrationTests.Fixtures;

namespace Onesign.IntegrationTests.Controllers;

public class FederationSamlControllerTests : IClassFixture<InMemoryWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly InMemoryWebApplicationFactory _factory;

    public FederationSamlControllerTests(InMemoryWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    #region GET /api/tenant/federation/saml Tests

    [Fact]
    public async Task GetProviders_WithTenantId_ReturnsOkOrBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/federation/saml?tenantId={tenantId}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetProviders_WithoutTenantId_ReturnsBadRequest()
    {
        // Act
        var response = await _client.GetAsync("/api/tenant/federation/saml");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region POST /api/tenant/federation/saml Tests

    [Fact]
    public async Task CreateProvider_ValidRequest_ReturnsCreatedOrBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            Name = $"Test SAML Provider {Guid.NewGuid():N}",
            EntityId = "https://idp.example.com/entity",
            IdpSsoUrl = "https://idp.example.com/sso",
            IdpCertificate = "MIICert...",
            BindingType = "HttpPost",
            SignAuthRequest = true,
            WantAssertionsSigned = true
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/tenant/federation/saml?tenantId={tenantId}", request);

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
            EntityId = "https://idp.example.com/entity",
            IdpSsoUrl = "https://idp.example.com/sso",
            IdpCertificate = "MIICert...",
            BindingType = "HttpPost",
            SignAuthRequest = true,
            WantAssertionsSigned = true
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/tenant/federation/saml?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateProvider_EmptyEntityId_ReturnsBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            Name = "Test Provider",
            EntityId = "",
            IdpSsoUrl = "https://idp.example.com/sso",
            IdpCertificate = "MIICert...",
            BindingType = "HttpPost",
            SignAuthRequest = true,
            WantAssertionsSigned = true
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/tenant/federation/saml?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateProvider_InvalidSsoUrl_ReturnsBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            Name = "Test Provider",
            EntityId = "https://idp.example.com/entity",
            IdpSsoUrl = "invalid-url",
            IdpCertificate = "MIICert...",
            BindingType = "HttpPost",
            SignAuthRequest = true,
            WantAssertionsSigned = true
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/tenant/federation/saml?tenantId={tenantId}", request);

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
            EntityId = "https://idp.example.com/entity",
            IdpSsoUrl = "https://idp.example.com/sso",
            IdpCertificate = "MIICert...",
            BindingType = "HttpPost",
            SignAuthRequest = true,
            WantAssertionsSigned = true
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/tenant/federation/saml", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateProvider_InvalidBindingType_ReturnsBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            Name = "Test Provider",
            EntityId = "https://idp.example.com/entity",
            IdpSsoUrl = "https://idp.example.com/sso",
            IdpCertificate = "MIICert...",
            BindingType = "InvalidBinding",
            SignAuthRequest = true,
            WantAssertionsSigned = true
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/tenant/federation/saml?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion
}
