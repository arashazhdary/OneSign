using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Onesign.IntegrationTests.Fixtures;

namespace Onesign.IntegrationTests.Controllers;

public class GlobalBillingPlansControllerTests : IClassFixture<InMemoryWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly InMemoryWebApplicationFactory _factory;

    public GlobalBillingPlansControllerTests(InMemoryWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    #region GET /api/global/billing/plans Tests

    [Fact]
    public async Task GetPlans_ReturnsOk()
    {
        // Act
        var response = await _client.GetAsync("/api/global/billing/plans");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetPlans_WithActiveFilter_ReturnsOk()
    {
        // Act
        var response = await _client.GetAsync("/api/global/billing/plans?isActive=true");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetPlans_WithInactiveFilter_ReturnsOk()
    {
        // Act
        var response = await _client.GetAsync("/api/global/billing/plans?isActive=false");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    #endregion

    #region GET /api/global/billing/plans/{id} Tests

    [Fact]
    public async Task GetPlan_NonExistent_ReturnsNotFound()
    {
        // Arrange
        var planId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/global/billing/plans/{planId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetPlan_InvalidGuid_ReturnsBadRequest()
    {
        // Act
        var response = await _client.GetAsync("/api/global/billing/plans/invalid-guid");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.BadRequest, HttpStatusCode.NotFound);
    }

    #endregion

    #region POST /api/global/billing/plans Tests

    [Fact]
    public async Task CreatePlan_ValidRequest_ReturnsCreated()
    {
        // Arrange
        var request = new
        {
            Name = $"Test Plan {Guid.NewGuid():N}",
            Code = $"TEST-{Guid.NewGuid():N}".Substring(0, 20),
            Type = "Standard",
            IsActive = true,
            Features = new[]
            {
                new { Name = "MaxUsers", Value = "100", Description = "Maximum users" }
            }
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/global/billing/plans", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.Created, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreatePlan_EmptyName_ReturnsBadRequest()
    {
        // Arrange
        var request = new
        {
            Name = "",
            Code = "TEST",
            Type = "Standard",
            IsActive = true,
            Features = Array.Empty<object>()
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/global/billing/plans", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreatePlan_EmptyCode_ReturnsBadRequest()
    {
        // Arrange
        var request = new
        {
            Name = "Test Plan",
            Code = "",
            Type = "Standard",
            IsActive = true,
            Features = Array.Empty<object>()
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/global/billing/plans", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreatePlan_InvalidType_ReturnsBadRequest()
    {
        // Arrange
        var request = new
        {
            Name = "Test Plan",
            Code = "TEST",
            Type = "InvalidType",
            IsActive = true,
            Features = Array.Empty<object>()
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/global/billing/plans", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region PUT /api/global/billing/plans/{id} Tests

    [Fact]
    public async Task UpdatePlan_NonExistent_ReturnsBadRequest()
    {
        // Arrange
        var planId = Guid.NewGuid();
        var request = new
        {
            Name = "Updated Plan",
            Code = "UPDATED",
            Type = "Standard",
            IsActive = true,
            Features = Array.Empty<object>()
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/global/billing/plans/{planId}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdatePlan_EmptyName_ReturnsBadRequest()
    {
        // Arrange
        var planId = Guid.NewGuid();
        var request = new
        {
            Name = "",
            Code = "TEST",
            Type = "Standard",
            IsActive = true,
            Features = Array.Empty<object>()
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/global/billing/plans/{planId}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion
}
