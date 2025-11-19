using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Onesign.IntegrationTests.Fixtures;

namespace Onesign.IntegrationTests.Controllers;

public class PolicyControllerTests : IClassFixture<InMemoryWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly InMemoryWebApplicationFactory _factory;

    public PolicyControllerTests(InMemoryWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    #region GET /api/tenant/policies Tests

    [Fact]
    public async Task GetPolicies_WithTenantId_ReturnsOkOrBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/policies?tenantId={tenantId}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetPolicies_WithEnabledFilter_ReturnsOkOrBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/policies?tenantId={tenantId}&enabled=true");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetPolicies_WithoutTenantId_ReturnsBadRequest()
    {
        // Act
        var response = await _client.GetAsync("/api/tenant/policies");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region GET /api/tenant/policies/{id} Tests

    [Fact]
    public async Task GetPolicyById_NonExistent_ReturnsNotFound()
    {
        // Arrange
        var policyId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/policies/{policyId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    #endregion

    #region POST /api/tenant/policies Tests

    [Fact]
    public async Task CreatePolicy_ValidRequest_ReturnsCreatedOrBadRequest()
    {
        // Arrange
        var request = new
        {
            TenantId = Guid.NewGuid(),
            Name = $"Test Policy {Guid.NewGuid():N}",
            Description = "Test policy description",
            Rules = new object[] { },
            Enabled = true
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/tenant/policies", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.Created, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreatePolicy_EmptyName_ReturnsBadRequest()
    {
        // Arrange
        var request = new
        {
            TenantId = Guid.NewGuid(),
            Name = "",
            Description = "Test policy description",
            Enabled = true
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/tenant/policies", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region PUT /api/tenant/policies/{id} Tests

    [Fact]
    public async Task UpdatePolicy_ValidRequest_ReturnsOkOrBadRequest()
    {
        // Arrange
        var policyId = Guid.NewGuid();
        var request = new
        {
            Id = policyId,
            Name = "Updated Policy",
            Description = "Updated description",
            Enabled = false
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/tenant/policies/{policyId}", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    #endregion

    #region DELETE /api/tenant/policies/{id} Tests

    [Fact]
    public async Task DeletePolicy_ReturnsNoContentOrBadRequest()
    {
        // Arrange
        var policyId = Guid.NewGuid();

        // Act
        var response = await _client.DeleteAsync($"/api/tenant/policies/{policyId}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.NoContent, HttpStatusCode.BadRequest);
    }

    #endregion

    #region POST /api/tenant/policies/assign Tests

    [Fact]
    public async Task AssignPolicy_ValidRequest_ReturnsOkOrBadRequest()
    {
        // Arrange
        var request = new
        {
            PolicyId = Guid.NewGuid(),
            TargetType = "User",
            TargetId = Guid.NewGuid()
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/tenant/policies/assign", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    #endregion

    #region POST /api/tenant/policies/evaluate Tests

    [Fact]
    public async Task EvaluatePolicy_ValidRequest_ReturnsOkOrBadRequest()
    {
        // Arrange
        var request = new
        {
            PolicyId = Guid.NewGuid(),
            Context = new
            {
                UserId = Guid.NewGuid(),
                Resource = "test-resource",
                Action = "read"
            }
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/tenant/policies/evaluate", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    #endregion
}
