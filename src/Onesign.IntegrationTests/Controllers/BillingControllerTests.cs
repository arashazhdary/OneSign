using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Onesign.IntegrationTests.Fixtures;

namespace Onesign.IntegrationTests.Controllers;

public class BillingControllerTests : IClassFixture<InMemoryWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly InMemoryWebApplicationFactory _factory;

    public BillingControllerTests(InMemoryWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    #region GET /api/tenant/billing/summary Tests

    [Fact]
    public async Task GetBillingSummary_WithTenantId_ReturnsOkOrBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/billing/summary?tenantId={tenantId}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetBillingSummary_WithoutTenantId_ReturnsBadRequest()
    {
        // Act
        var response = await _client.GetAsync("/api/tenant/billing/summary");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region GET /api/tenant/billing/quota-status Tests

    [Fact]
    public async Task GetQuotaStatus_WithTenantId_ReturnsOkOrBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/billing/quota-status?tenantId={tenantId}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetQuotaStatus_WithoutTenantId_ReturnsBadRequest()
    {
        // Act
        var response = await _client.GetAsync("/api/tenant/billing/quota-status");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region GET /api/tenant/billing/subscription Tests

    [Fact]
    public async Task GetSubscription_WithTenantId_ReturnsOkOrNotFound()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/billing/subscription?tenantId={tenantId}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.NotFound, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetSubscription_WithoutTenantId_ReturnsBadRequest()
    {
        // Act
        var response = await _client.GetAsync("/api/tenant/billing/subscription");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region POST /api/tenant/billing/upgrade-requests Tests

    [Fact]
    public async Task RequestUpgrade_ValidRequest_ReturnsOk()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            TargetPlanId = Guid.NewGuid(),
            Comments = "Need more users"
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/tenant/billing/upgrade-requests?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task RequestUpgrade_WithoutComments_ReturnsOk()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            TargetPlanId = Guid.NewGuid(),
            Comments = (string?)null
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/tenant/billing/upgrade-requests?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task RequestUpgrade_WithoutTenantId_ReturnsBadRequest()
    {
        // Arrange
        var request = new
        {
            TargetPlanId = Guid.NewGuid(),
            Comments = "Need more users"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/tenant/billing/upgrade-requests", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion
}
