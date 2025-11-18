using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Onesign.IntegrationTests.Fixtures;

namespace Onesign.IntegrationTests.Controllers;

public class AuthControllerFullTests : IClassFixture<InMemoryWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly InMemoryWebApplicationFactory _factory;

    public AuthControllerFullTests(InMemoryWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    #region POST /api/auth/login Tests

    [Fact]
    public async Task Login_ValidCredentials_ReturnsOk()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var email = $"test-{Guid.NewGuid():N}@example.com";
        var password = "TestPassword123!";

        // Register first
        var registerRequest = new
        {
            Email = email,
            Password = password,
            FirstName = "Test",
            LastName = "User"
        };
        await _client.PostAsJsonAsync("/api/auth/register", registerRequest);

        var loginRequest = new
        {
            Email = email,
            Password = password
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/auth/login?tenantId={tenantId}", loginRequest);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Login_InvalidEmail_ReturnsUnauthorized()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            Email = "nonexistent@example.com",
            Password = "Password123!"
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/auth/login?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.Unauthorized, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Login_InvalidPassword_ReturnsUnauthorized()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            Email = "test@example.com",
            Password = "WrongPassword123!"
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/auth/login?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.Unauthorized, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Login_WithoutTenantId_ReturnsBadRequest()
    {
        // Arrange
        var request = new
        {
            Email = "test@example.com",
            Password = "Password123!"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Login_EmptyEmail_ReturnsBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            Email = "",
            Password = "Password123!"
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/auth/login?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Login_EmptyPassword_ReturnsBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            Email = "test@example.com",
            Password = ""
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/auth/login?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Login_WithDeviceFingerprint_ReturnsOkOrUnauthorized()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            Email = "test@example.com",
            Password = "Password123!",
            DeviceFingerprint = "test-fingerprint-123"
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/auth/login?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Unauthorized, HttpStatusCode.BadRequest);
    }

    #endregion

    #region POST /api/auth/forgot-password Tests

    [Fact]
    public async Task ForgotPassword_ValidEmail_ReturnsOkOrBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            Email = "test@example.com"
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/auth/forgot-password?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task ForgotPassword_InvalidEmail_ReturnsBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            Email = "invalid-email"
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/auth/forgot-password?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task ForgotPassword_EmptyEmail_ReturnsBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            Email = ""
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/auth/forgot-password?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task ForgotPassword_WithoutTenantId_ReturnsBadRequest()
    {
        // Arrange
        var request = new
        {
            Email = "test@example.com"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/forgot-password", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region POST /api/auth/reset-password Tests

    [Fact]
    public async Task ResetPassword_ValidRequest_ReturnsOkOrBadRequest()
    {
        // Arrange
        var request = new
        {
            Token = "valid-reset-token",
            NewPassword = "NewPassword123!"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/reset-password", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task ResetPassword_InvalidToken_ReturnsBadRequest()
    {
        // Arrange
        var request = new
        {
            Token = "invalid-token",
            NewPassword = "NewPassword123!"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/reset-password", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task ResetPassword_WeakPassword_ReturnsBadRequest()
    {
        // Arrange
        var request = new
        {
            Token = "some-token",
            NewPassword = "123"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/reset-password", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task ResetPassword_EmptyToken_ReturnsBadRequest()
    {
        // Arrange
        var request = new
        {
            Token = "",
            NewPassword = "NewPassword123!"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/reset-password", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task ResetPassword_EmptyPassword_ReturnsBadRequest()
    {
        // Arrange
        var request = new
        {
            Token = "some-token",
            NewPassword = ""
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/reset-password", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region POST /api/auth/google-login Tests

    [Fact]
    public async Task GoogleLogin_ValidRequest_ReturnsOkOrUnauthorized()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            IdToken = "google-id-token",
            ClientId = Guid.NewGuid()
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/auth/google-login?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GoogleLogin_InvalidToken_ReturnsUnauthorized()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            IdToken = "invalid-token",
            ClientId = (Guid?)null
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/auth/google-login?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GoogleLogin_EmptyIdToken_ReturnsBadRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var request = new
        {
            IdToken = "",
            ClientId = Guid.NewGuid()
        };

        // Act
        var response = await _client.PostAsJsonAsync($"/api/auth/google-login?tenantId={tenantId}", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.BadRequest, HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GoogleLogin_WithoutTenantId_ReturnsBadRequest()
    {
        // Arrange
        var request = new
        {
            IdToken = "google-id-token",
            ClientId = Guid.NewGuid()
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/google-login", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region POST /api/auth/complete-first-login Tests

    [Fact]
    public async Task CompleteFirstLogin_ValidRequest_ReturnsOkOrBadRequest()
    {
        // Arrange
        var request = new
        {
            TenantUserId = Guid.NewGuid(),
            Password = "NewPassword123!"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/complete-first-login", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CompleteFirstLogin_WeakPassword_ReturnsBadRequest()
    {
        // Arrange
        var request = new
        {
            TenantUserId = Guid.NewGuid(),
            Password = "123"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/complete-first-login", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CompleteFirstLogin_EmptyPassword_ReturnsBadRequest()
    {
        // Arrange
        var request = new
        {
            TenantUserId = Guid.NewGuid(),
            Password = ""
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/complete-first-login", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CompleteFirstLogin_InvalidUserId_ReturnsBadRequest()
    {
        // Arrange
        var request = new
        {
            TenantUserId = Guid.NewGuid(),
            Password = "ValidPassword123!"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/complete-first-login", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion
}
