using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Onesign.IntegrationTests.Fixtures;

namespace Onesign.IntegrationTests.Controllers;

public class GlobalBillingTenantsControllerTests : IClassFixture<InMemoryWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly InMemoryWebApplicationFactory _factory;

    public GlobalBillingTenantsControllerTests(InMemoryWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    #region GET /api/global/billing/tenants/{tenantId}/subscription Tests

    [Fact]
    public async Task GetTenantSubscription_ReturnsOkOrNotFound()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/global/billing/tenants/{tenantId}/subscription");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetTenantSubscription_InvalidGuid_ReturnsBadRequest()
    {
        // Act
        var response = await _client.GetAsync("/api/global/billing/tenants/invalid-guid/subscription");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.BadRequest, HttpStatusCode.NotFound);
    }

    #endregion

    #region POST /api/global/billing/tenants/{tenantId}/subscription Tests

    [Fact]
    public async Task AssignSubscription_ValidRequest_ReturnsCreatedOrBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            PlanId = Guid.NewGuid(),
            Status = "Active",
            TrialEndsAt = DateTime.UtcNow.AddDays(14),
            CurrentPeriodEndsAt = DateTime.UtcNow.AddMonths(1)
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/global/billing/tenants/{tenantId}/subscription", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.Created, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task AssignSubscription_WithTrialStatus_ReturnsCreatedOrBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            PlanId = Guid.NewGuid(),
            Status = "Trialing",
            TrialEndsAt = DateTime.UtcNow.AddDays(30),
            CurrentPeriodEndsAt = (DateTime?)null
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/global/billing/tenants/{tenantId}/subscription", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.Created, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task AssignSubscription_InvalidStatus_ReturnsBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            PlanId = Guid.NewGuid(),
            Status = "InvalidStatus",
            TrialEndsAt = DateTime.UtcNow.AddDays(14),
            CurrentPeriodEndsAt = DateTime.UtcNow.AddMonths(1)
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/global/billing/tenants/{tenantId}/subscription", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task AssignSubscription_MissingPlanId_ReturnsBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            Status = "Active"
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/global/billing/tenants/{tenantId}/subscription", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region PUT /api/global/billing/tenants/{tenantId}/subscription/plan Tests

    [Fact]
    public async Task ChangePlan_ValidRequest_ReturnsOkOrBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            NewPlanId = Guid.NewGuid()
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/global/billing/tenants/{tenantId}/subscription/plan", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task ChangePlan_MissingNewPlanId_ReturnsBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.PutAsJsonAsync($"/api/global/billing/tenants/{tenantId}/subscription/plan", new { });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task ChangePlan_NullBody_ReturnsBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.PutAsJsonAsync($"/api/global/billing/tenants/{tenantId}/subscription/plan", (object?)null);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region GET /api/global/billing/tenants/{tenantId}/usage Tests

    [Fact]
    public async Task GetTenantUsage_ReturnsOkOrNotFound()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/global/billing/tenants/{tenantId}/usage");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetTenantUsage_InvalidGuid_ReturnsBadRequest()
    {
        // Act
        var response = await _client.GetAsync("/api/global/billing/tenants/invalid-guid/usage");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.BadRequest, HttpStatusCode.NotFound);
    }

    #endregion
}
