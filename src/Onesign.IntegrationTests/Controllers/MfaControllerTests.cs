using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Onesign.IntegrationTests.Fixtures;

namespace Onesign.IntegrationTests.Controllers;

public class MfaControllerTests : IClassFixture<InMemoryWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly InMemoryWebApplicationFactory _factory;

    public MfaControllerTests(InMemoryWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    #region GET /api/tenant/mfa/methods Tests

    [Fact]
    public async Task GetMethods_WithUserId_ReturnsOk()
    {
        // Arrange
        var userId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/mfa/methods?userId={userId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetMethods_WithoutUserId_ReturnsBadRequest()
    {
        // Act
        var response = await _client.GetAsync("/api/tenant/mfa/methods");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region POST /api/tenant/mfa/totp/begin Tests

    [Fact]
    public async Task BeginTotpEnrollment_ValidRequest_ReturnsOk()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var userEmail = "test@example.com";

        // Act
        var response = await _client.PostAsync($"/api/tenant/mfa/totp/begin?userId={userId}&userEmail={userEmail}", null);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task BeginTotpEnrollment_WithoutUserId_ReturnsBadRequest()
    {
        // Act
        var response = await _client.PostAsync("/api/tenant/mfa/totp/begin?userEmail=test@example.com", null);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task BeginTotpEnrollment_WithoutEmail_ReturnsBadRequest()
    {
        // Arrange
        var userId = Guid.NewGuid();

        // Act
        var response = await _client.PostAsync($"/api/tenant/mfa/totp/begin?userId={userId}", null);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region POST /api/tenant/mfa/totp/confirm Tests

    [Fact]
    public async Task ConfirmTotpEnrollment_ValidRequest_ReturnsOkOrBadRequest()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var request = new
        {
            Secret = "TESTSECRET123456",
            Code = "123456"
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/tenant/mfa/totp/confirm?userId={userId}&tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task ConfirmTotpEnrollment_InvalidCode_ReturnsBadRequest()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var request = new
        {
            Secret = "TESTSECRET123456",
            Code = "000000"
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/tenant/mfa/totp/confirm?userId={userId}&tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task ConfirmTotpEnrollment_MissingSecret_ReturnsBadRequest()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var request = new
        {
            Code = "123456"
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/tenant/mfa/totp/confirm?userId={userId}&tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region DELETE /api/tenant/mfa/methods/{methodId} Tests

    [Fact]
    public async Task DisableMethod_ValidRequest_ReturnsNoContentOrBadRequest()
    {
        // Arrange
        var methodId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        // Act
        var response = await _client.DeleteAsync($"/api/tenant/mfa/methods/{methodId}?userId={userId}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.NoContent, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task DisableMethod_WithoutUserId_ReturnsBadRequest()
    {
        // Arrange
        var methodId = Guid.NewGuid();

        // Act
        var response = await _client.DeleteAsync($"/api/tenant/mfa/methods/{methodId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region POST /api/tenant/mfa/challenge Tests

    [Fact]
    public async Task CreateChallenge_ValidRequest_ReturnsOkOrBadRequest()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var userEmail = "test@example.com";
        var request = new
        {
            PreferredMethodType = "Totp"
        };

        // Act
        var response = await _client.PostAsJsonAsync(
            $"/api/tenant/mfa/challenge?userId={userId}&tenantId={tenantId}&userEmail={userEmail}", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    #endregion

    #region POST /api/tenant/mfa/verify Tests

    [Fact]
    public async Task VerifyChallenge_ValidRequest_ReturnsOk()
    {
        // Arrange
        var request = new
        {
            ChallengeId = Guid.NewGuid(),
            Code = "123456",
            RememberDevice = false,
            DeviceFingerprint = "test-fingerprint"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/tenant/mfa/verify", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task VerifyChallenge_MissingCode_ReturnsBadRequest()
    {
        // Arrange
        var request = new
        {
            ChallengeId = Guid.NewGuid(),
            RememberDevice = false
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/tenant/mfa/verify", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region GET /api/tenant/mfa/check-requirement Tests

    [Fact]
    public async Task CheckMfaRequirement_ValidRequest_ReturnsOk()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/mfa/check-requirement?tenantId={tenantId}&userId={userId}&isAdmin=false");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task CheckMfaRequirement_WithOrgUnit_ReturnsOk()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var orgUnitId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync(
            $"/api/tenant/mfa/check-requirement?tenantId={tenantId}&userId={userId}&orgUnitId={orgUnitId}&isAdmin=true");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task CheckMfaRequirement_MissingTenantId_ReturnsBadRequest()
    {
        // Arrange
        var userId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/tenant/mfa/check-requirement?userId={userId}&isAdmin=false");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion
}
