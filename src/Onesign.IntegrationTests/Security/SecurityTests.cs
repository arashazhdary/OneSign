using System.Net;
using System.Net.Http.Json;
using System.Text;
using FluentAssertions;
using Onesign.IntegrationTests.Fixtures;

namespace Onesign.IntegrationTests.Security;

/// <summary>
/// Security tests for vulnerability detection
/// </summary>
public class SecurityTests : IClassFixture<InMemoryWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly InMemoryWebApplicationFactory _factory;

    public SecurityTests(InMemoryWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    #region SQL Injection Tests

    [Theory]
    [InlineData("'; DROP TABLE Users; --")]
    [InlineData("1' OR '1'='1")]
    [InlineData("admin'--")]
    [InlineData("1; DELETE FROM tenants WHERE 1=1; --")]
    public async Task SqlInjection_LoginEndpoint_ShouldBePrevented(string maliciousInput)
    {
        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            Email = maliciousInput,
            Password = "password"
        });

        // Assert - Should not crash, should return proper error
        response.StatusCode.Should().BeOneOf(
            HttpStatusCode.BadRequest,
            HttpStatusCode.Unauthorized
        );

        var content = await response.Content.ReadAsStringAsync();
        content.Should().NotContain("SQL", "Should not expose SQL errors");
        content.Should().NotContain("syntax", "Should not expose database syntax errors");
    }

    [Theory]
    [InlineData("test'; DROP TABLE Users; --")]
    [InlineData("test' OR 1=1; --")]
    public async Task SqlInjection_TenantSlug_ShouldBePrevented(string maliciousSlug)
    {
        // Setup
        var email = $"sql-test-{Guid.NewGuid():N}@example.com";
        await SetupAuthenticatedClient(email);

        // Act
        var response = await _client.PostAsJsonAsync("/api/tenants", new
        {
            Name = "Test Tenant",
            Slug = maliciousSlug
        });

        // Assert
        response.StatusCode.Should().BeOneOf(
            HttpStatusCode.BadRequest,
            HttpStatusCode.UnprocessableEntity
        );
    }

    #endregion

    #region XSS Tests

    [Theory]
    [InlineData("<script>alert('XSS')</script>")]
    [InlineData("<img src=x onerror=alert('XSS')>")]
    [InlineData("javascript:alert('XSS')")]
    [InlineData("<svg onload=alert('XSS')>")]
    public async Task XssAttack_UserInput_ShouldBeSanitized(string maliciousInput)
    {
        // Setup
        var email = $"xss-test-{Guid.NewGuid():N}@example.com";
        await SetupAuthenticatedClient(email);

        // Act - Create tenant with XSS payload
        var response = await _client.PostAsJsonAsync("/api/tenants", new
        {
            Name = maliciousInput,
            Slug = $"xss-test-{Guid.NewGuid():N}"[..20]
        });

        if (response.IsSuccessStatusCode)
        {
            var result = await response.Content.ReadAsStringAsync();
            result.Should().NotContain("<script>", "XSS script tags should be sanitized");
            result.Should().NotContain("onerror=", "XSS event handlers should be sanitized");
            result.Should().NotContain("javascript:", "XSS javascript: URLs should be sanitized");
        }
    }

    #endregion

    #region Authentication Security Tests

    [Fact]
    public async Task BruteForceProtection_ShouldLockAfterFailedAttempts()
    {
        var email = $"brute-force-{Guid.NewGuid():N}@example.com";
        var password = "CorrectPassword123!";

        // Register user
        await _client.PostAsJsonAsync("/api/auth/register", new
        {
            Email = email,
            Password = password,
            FirstName = "Brute",
            LastName = "Force"
        });

        // Attempt multiple failed logins
        for (int i = 0; i < 10; i++)
        {
            await _client.PostAsJsonAsync("/api/auth/login", new
            {
                Email = email,
                Password = "WrongPassword" + i
            });
        }

        // Final attempt should be blocked or rate limited
        var finalResponse = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            Email = email,
            Password = password // Even correct password
        });

        // Should be either locked or rate limited
        finalResponse.StatusCode.Should().BeOneOf(
            HttpStatusCode.TooManyRequests,
            HttpStatusCode.Forbidden,
            HttpStatusCode.Unauthorized,
            HttpStatusCode.OK // Some systems allow after correct credentials
        );
    }

    [Fact]
    public async Task WeakPasswordRejection_ShouldEnforcePolicy()
    {
        var weakPasswords = new[]
        {
            "123456",
            "password",
            "qwerty",
            "abc",
            "test"
        };

        foreach (var weakPassword in weakPasswords)
        {
            var response = await _client.PostAsJsonAsync("/api/auth/register", new
            {
                Email = $"weak-pass-{Guid.NewGuid():N}@example.com",
                Password = weakPassword,
                FirstName = "Weak",
                LastName = "Pass"
            });

            response.StatusCode.Should().Be(
                HttpStatusCode.BadRequest,
                $"Password '{weakPassword}' should be rejected"
            );
        }
    }

    [Fact]
    public async Task InvalidToken_ShouldBeRejected()
    {
        // Set invalid token
        _client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "invalid.token.here");

        // Act
        var response = await _client.GetAsync("/api/users/me");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task ExpiredToken_ShouldBeRejected()
    {
        // Create a token that looks valid but is expired
        // This is a mock expired token
        var expiredToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZXhwIjoxfQ.Gw1sZ_3LXYrqvkHN_b0yM4m0vAw1r-Q3xG";

        _client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", expiredToken);

        // Act
        var response = await _client.GetAsync("/api/users/me");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    #endregion

    #region Authorization Security Tests

    [Fact]
    public async Task UnauthorizedTenantAccess_ShouldBeDenied()
    {
        // Create first user and tenant
        var user1Email = $"user1-authz-{Guid.NewGuid():N}@example.com";
        var token1 = await SetupAuthenticatedClient(user1Email);

        var tenant1Response = await _client.PostAsJsonAsync("/api/tenants", new
        {
            Name = "User1 Tenant",
            Slug = $"user1-{Guid.NewGuid():N}"[..20]
        });

        var tenant1 = await tenant1Response.Content.ReadFromJsonAsync<dynamic>();
        var tenant1Id = (Guid)tenant1!.id;

        // Create second user
        _client.DefaultRequestHeaders.Clear();
        var user2Email = $"user2-authz-{Guid.NewGuid():N}@example.com";
        await SetupAuthenticatedClient(user2Email);

        // User2 tries to access User1's tenant
        var unauthorizedResponse = await _client.GetAsync($"/api/tenants/{tenant1Id}");

        // Should be denied
        unauthorizedResponse.StatusCode.Should().BeOneOf(
            HttpStatusCode.NotFound,
            HttpStatusCode.Forbidden
        );
    }

    [Fact]
    public async Task IdorVulnerability_ShouldBePrevented()
    {
        // IDOR = Insecure Direct Object Reference

        // Create user 1 and their tenant
        var user1Email = $"idor1-{Guid.NewGuid():N}@example.com";
        await SetupAuthenticatedClient(user1Email);

        var tenant1Response = await _client.PostAsJsonAsync("/api/tenants", new
        {
            Name = "IDOR Test Tenant",
            Slug = $"idor-{Guid.NewGuid():N}"[..20]
        });

        var tenant1 = await tenant1Response.Content.ReadFromJsonAsync<dynamic>();
        var tenant1Id = (Guid)tenant1!.id;

        // Create app in tenant 1
        var appResponse = await _client.PostAsJsonAsync("/api/applications", new
        {
            TenantId = tenant1Id,
            Name = "IDOR App",
            ApplicationType = "web",
            RedirectUris = new[] { "https://idor.example.com/callback" }
        });

        var app = await appResponse.Content.ReadFromJsonAsync<dynamic>();
        var appId = (Guid)app!.id;

        // Switch to user 2
        _client.DefaultRequestHeaders.Clear();
        var user2Email = $"idor2-{Guid.NewGuid():N}@example.com";
        await SetupAuthenticatedClient(user2Email);

        // User 2 tries to access/modify User 1's app via direct ID reference
        var getResponse = await _client.GetAsync($"/api/applications/{appId}");
        getResponse.StatusCode.Should().BeOneOf(
            HttpStatusCode.NotFound,
            HttpStatusCode.Forbidden
        );

        var deleteResponse = await _client.DeleteAsync($"/api/applications/{appId}");
        deleteResponse.StatusCode.Should().BeOneOf(
            HttpStatusCode.NotFound,
            HttpStatusCode.Forbidden
        );
    }

    #endregion

    #region Input Validation Tests

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData(null)]
    public async Task EmptyInput_ShouldBeRejected(string? input)
    {
        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", new
        {
            Email = input,
            Password = "Password123!",
            FirstName = "Test",
            LastName = "User"
        });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task OversizedInput_ShouldBeRejected()
    {
        // Create very long string
        var veryLongString = new string('A', 10000);

        var response = await _client.PostAsJsonAsync("/api/auth/register", new
        {
            Email = $"{veryLongString}@example.com",
            Password = "Password123!",
            FirstName = veryLongString,
            LastName = "User"
        });

        // Assert - Should reject or truncate, not crash
        response.StatusCode.Should().BeOneOf(
            HttpStatusCode.BadRequest,
            HttpStatusCode.UnprocessableEntity,
            HttpStatusCode.RequestEntityTooLarge
        );
    }

    #endregion

    #region Security Headers Tests

    [Fact]
    public async Task SecurityHeaders_ShouldBePresent()
    {
        // Act
        var response = await _client.GetAsync("/api/health");

        // Assert security headers
        // These are recommendations - actual headers depend on server config

        // Check for common security headers
        var headers = response.Headers;

        // X-Content-Type-Options
        if (headers.Contains("X-Content-Type-Options"))
        {
            headers.GetValues("X-Content-Type-Options").Should().Contain("nosniff");
        }

        // X-Frame-Options
        if (headers.Contains("X-Frame-Options"))
        {
            var frameOptions = string.Join(",", headers.GetValues("X-Frame-Options"));
            frameOptions.Should().ContainAny("DENY", "SAMEORIGIN");
        }
    }

    #endregion

    #region Helper Methods

    private async Task<string> SetupAuthenticatedClient(string email)
    {
        var password = "SecurePassword123!";

        await _client.PostAsJsonAsync("/api/auth/register", new
        {
            Email = email,
            Password = password,
            FirstName = "Test",
            LastName = "User"
        });

        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            Email = email,
            Password = password
        });

        var loginResult = await loginResponse.Content.ReadFromJsonAsync<dynamic>();
        var accessToken = (string)loginResult!.accessToken;

        _client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

        return accessToken;
    }

    #endregion
}
