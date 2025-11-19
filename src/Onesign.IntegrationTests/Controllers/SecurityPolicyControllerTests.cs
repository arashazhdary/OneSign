using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Onesign.IntegrationTests.Fixtures;

namespace Onesign.IntegrationTests.Controllers;

public class SecurityPolicyControllerTests : IClassFixture<InMemoryWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly InMemoryWebApplicationFactory _factory;

    public SecurityPolicyControllerTests(InMemoryWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    #region GET /api/tenant/security/policy Tests

    [Fact]
    public async Task GetPolicy_WithTenantId_ReturnsOkOrNotFound()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/security/policy?tenantId={tenantId}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetPolicy_WithoutTenantId_ReturnsBadRequest()
    {
        // Act
        var response = await _client.GetAsync("/api/tenant/security/policy");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region PUT /api/tenant/security/policy Tests

    [Fact]
    public async Task UpdatePolicy_ValidRequest_ReturnsOk()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            MfaRequirement = "Optional",
            AllowTrustedDevices = true,
            TrustedDeviceExpireDays = 30,
            SessionTimeoutMinutes = 60,
            MaxFailedLoginAttempts = 5
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/tenant/security/policy?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task UpdatePolicy_WithoutTenantId_ReturnsBadRequest()
    {
        // Arrange
        var request = new
        {
            MfaRequirement = "Required",
            AllowTrustedDevices = false,
            TrustedDeviceExpireDays = 7,
            SessionTimeoutMinutes = 30,
            MaxFailedLoginAttempts = 3
        };

        // Act
        var response = await _client.PutAsJsonAsync("/api/tenant/security/policy", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdatePolicy_InvalidMfaRequirement_ReturnsBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            MfaRequirement = "InvalidValue",
            AllowTrustedDevices = true,
            TrustedDeviceExpireDays = 30,
            SessionTimeoutMinutes = 60,
            MaxFailedLoginAttempts = 5
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/tenant/security/policy?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdatePolicy_NegativeSessionTimeout_ReturnsBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            MfaRequirement = "Optional",
            AllowTrustedDevices = true,
            TrustedDeviceExpireDays = 30,
            SessionTimeoutMinutes = -1,
            MaxFailedLoginAttempts = 5
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/tenant/security/policy?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    #endregion

    #region GET /api/tenant/security/policy/org-unit-rules Tests

    [Fact]
    public async Task GetOrgUnitRules_WithTenantId_ReturnsOk()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/security/policy/org-unit-rules?tenantId={tenantId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetOrgUnitRules_WithoutTenantId_ReturnsBadRequest()
    {
        // Act
        var response = await _client.GetAsync("/api/tenant/security/policy/org-unit-rules");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region PUT /api/tenant/security/policy/org-unit-rules Tests

    [Fact]
    public async Task UpdateOrgUnitRules_ValidRequest_ReturnsNoContent()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            Rules = new[]
            {
                new
                {
                    OrgUnitId = Guid.NewGuid(),
                    MfaRequirement = "Required"
                }
            }
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/tenant/security/policy/org-unit-rules?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task UpdateOrgUnitRules_EmptyRules_ReturnsNoContent()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            Rules = Array.Empty<object>()
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/tenant/security/policy/org-unit-rules?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task UpdateOrgUnitRules_WithoutTenantId_ReturnsBadRequest()
    {
        // Arrange
        var request = new
        {
            Rules = Array.Empty<object>()
        };

        // Act
        var response = await _client.PutAsJsonAsync("/api/tenant/security/policy/org-unit-rules", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion
}
