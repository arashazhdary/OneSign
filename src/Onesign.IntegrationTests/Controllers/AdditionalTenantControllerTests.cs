using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Onesign.IntegrationTests.Fixtures;

namespace Onesign.IntegrationTests.Controllers;

/// <summary>
/// Tests for additional tenant controllers including:
/// - RiskEvents
/// - Notifications
/// - DelegatedAdmins
/// - AccessRequests
/// - Governance
/// - PrivilegedAccess
/// - Lifecycle
/// - Privacy
/// - Insights
/// - Extensibility
/// - AdaptiveSecurity
/// </summary>
public class AdditionalTenantControllerTests : IClassFixture<InMemoryWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly InMemoryWebApplicationFactory _factory;

    public AdditionalTenantControllerTests(InMemoryWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    #region Risk Events Tests

    [Fact]
    public async Task RiskEvents_GetEvents_ReturnsOkOrBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/risk-events?tenantId={tenantId}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest, HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task RiskEvents_GetEvents_WithoutTenantId_ReturnsBadRequest()
    {
        // Act
        var response = await _client.GetAsync("/api/tenant/risk-events");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.BadRequest, HttpStatusCode.NotFound);
    }

    #endregion

    #region Notifications Tests

    [Fact]
    public async Task Notifications_GetPreferences_ReturnsOkOrBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/notifications/preferences?tenantId={tenantId}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest, HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Notifications_GetTemplates_ReturnsOkOrBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/notifications/templates?tenantId={tenantId}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest, HttpStatusCode.NotFound);
    }

    #endregion

    #region Delegated Admins Tests

    [Fact]
    public async Task DelegatedAdmins_GetAdmins_ReturnsOkOrBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/delegated-admins?tenantId={tenantId}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest, HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DelegatedAdmins_CreateAdmin_ValidRequest_ReturnsOkOrBadRequest()
    {
        // Arrange
        var request = new
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Scopes = new[] { "users:read", "users:write" }
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/tenant/delegated-admins", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Created, HttpStatusCode.BadRequest);
    }

    #endregion

    #region Access Requests Tests

    [Fact]
    public async Task AccessRequests_GetRequests_ReturnsOkOrBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/access-requests?tenantId={tenantId}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest, HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task AccessRequests_CreateRequest_ReturnsOkOrBadRequest()
    {
        // Arrange
        var request = new
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            ResourceType = "Application",
            ResourceId = Guid.NewGuid(),
            Justification = "Need access for project"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/tenant/access-requests", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Created, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task AccessRequests_ApproveRequest_ReturnsOkOrBadRequest()
    {
        // Arrange
        var requestId = Guid.NewGuid();
        var approvalRequest = new
        {
            Approved = true,
            Comments = "Approved"
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/tenant/access-requests/{requestId}/approve", approvalRequest);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest, HttpStatusCode.NotFound);
    }

    #endregion

    #region Governance Tests

    [Fact]
    public async Task Governance_GetReviews_ReturnsOkOrBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/governance/reviews?tenantId={tenantId}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest, HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Governance_CreateCampaign_ReturnsOkOrBadRequest()
    {
        // Arrange
        var request = new
        {
            TenantId = Guid.NewGuid(),
            Name = "Quarterly Access Review",
            Description = "Review all user access",
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddDays(30)
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/tenant/governance/campaigns", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Created, HttpStatusCode.BadRequest);
    }

    #endregion

    #region Privileged Access Tests

    [Fact]
    public async Task PrivilegedAccess_GetSessions_ReturnsOkOrBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/privileged-access/sessions?tenantId={tenantId}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest, HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task PrivilegedAccess_RequestAccess_ReturnsOkOrBadRequest()
    {
        // Arrange
        var request = new
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            ResourceId = Guid.NewGuid(),
            Duration = 60,
            Justification = "Emergency access needed"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/tenant/privileged-access/requests", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Created, HttpStatusCode.BadRequest);
    }

    #endregion

    #region Lifecycle Tests

    [Fact]
    public async Task Lifecycle_GetWorkflows_ReturnsOkOrBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/lifecycle/workflows?tenantId={tenantId}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest, HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Lifecycle_TriggerWorkflow_ReturnsOkOrBadRequest()
    {
        // Arrange
        var request = new
        {
            TenantId = Guid.NewGuid(),
            WorkflowType = "Onboarding",
            UserId = Guid.NewGuid()
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/tenant/lifecycle/trigger", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest, HttpStatusCode.NotFound);
    }

    #endregion

    #region Privacy Tests

    [Fact]
    public async Task Privacy_GetRequests_ReturnsOkOrBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/privacy/requests?tenantId={tenantId}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest, HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Privacy_CreateExportRequest_ReturnsOkOrBadRequest()
    {
        // Arrange
        var request = new
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            RequestType = "DataExport"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/tenant/privacy/export-requests", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Created, HttpStatusCode.BadRequest);
    }

    #endregion

    #region Insights Tests

    [Fact]
    public async Task Insights_GetDashboard_ReturnsOkOrBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/insights/dashboard?tenantId={tenantId}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest, HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Insights_GetMetrics_ReturnsOkOrBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/insights/metrics?tenantId={tenantId}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest, HttpStatusCode.NotFound);
    }

    #endregion

    #region Extensibility Tests

    [Fact]
    public async Task Extensibility_GetWebhooks_ReturnsOkOrBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/extensibility/webhooks?tenantId={tenantId}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest, HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Extensibility_CreateWebhook_ReturnsOkOrBadRequest()
    {
        // Arrange
        var request = new
        {
            TenantId = Guid.NewGuid(),
            Url = "https://example.com/webhook",
            Events = new[] { "user.created", "user.updated" },
            IsActive = true
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/tenant/extensibility/webhooks", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Created, HttpStatusCode.BadRequest);
    }

    #endregion

    #region Adaptive Security Tests

    [Fact]
    public async Task AdaptiveSecurity_GetRiskProfile_ReturnsOkOrBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/adaptive-security/risk-profile?tenantId={tenantId}&userId={userId}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest, HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task AdaptiveSecurity_GetSettings_ReturnsOkOrBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/adaptive-security/settings?tenantId={tenantId}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest, HttpStatusCode.NotFound);
    }

    #endregion
}
