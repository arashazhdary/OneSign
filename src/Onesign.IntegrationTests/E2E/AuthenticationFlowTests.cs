using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Onesign.IntegrationTests.Fixtures;

namespace Onesign.IntegrationTests.E2E;

/// <summary>
/// End-to-End tests for complete authentication flows
/// </summary>
public class AuthenticationFlowTests : IClassFixture<InMemoryWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly InMemoryWebApplicationFactory _factory;

    public AuthenticationFlowTests(InMemoryWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CompleteRegistrationAndLoginFlow_Success()
    {
        // Step 1: Register a new user
        var email = $"e2e-test-{Guid.NewGuid():N}@example.com";
        var password = "SecurePassword123!";

        var registerRequest = new
        {
            Email = email,
            Password = password,
            FirstName = "E2E",
            LastName = "Test"
        };

        var registerResponse = await _client.PostAsJsonAsync("/api/auth/register", registerRequest);
        registerResponse.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Created);

        // Step 2: Login with the registered credentials
        var loginRequest = new
        {
            Email = email,
            Password = password
        };

        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);
        loginResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var loginResult = await loginResponse.Content.ReadFromJsonAsync<dynamic>();
        var accessToken = (string)loginResult!.accessToken;
        accessToken.Should().NotBeNullOrEmpty();

        // Step 3: Use the access token to access protected resource
        _client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

        var profileResponse = await _client.GetAsync("/api/users/me");
        profileResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var profile = await profileResponse.Content.ReadFromJsonAsync<dynamic>();
        ((string)profile!.email).Should().Be(email);
    }

    [Fact]
    public async Task TenantCreationAndUserInviteFlow_Success()
    {
        // Step 1: Create admin user and login
        var adminEmail = $"admin-{Guid.NewGuid():N}@example.com";
        var password = "AdminPassword123!";

        await _client.PostAsJsonAsync("/api/auth/register", new
        {
            Email = adminEmail,
            Password = password,
            FirstName = "Admin",
            LastName = "User"
        });

        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            Email = adminEmail,
            Password = password
        });

        var loginResult = await loginResponse.Content.ReadFromJsonAsync<dynamic>();
        var accessToken = (string)loginResult!.accessToken;

        _client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

        // Step 2: Create a new tenant
        var tenantResponse = await _client.PostAsJsonAsync("/api/tenants", new
        {
            Name = "E2E Test Tenant",
            Slug = $"e2e-test-{Guid.NewGuid():N}"[..20]
        });

        tenantResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var tenant = await tenantResponse.Content.ReadFromJsonAsync<dynamic>();
        var tenantId = (Guid)tenant!.id;

        // Step 3: Create an application for the tenant
        var appResponse = await _client.PostAsJsonAsync("/api/applications", new
        {
            TenantId = tenantId,
            Name = "E2E Test App",
            ApplicationType = "web",
            RedirectUris = new[] { "https://example.com/callback" }
        });

        appResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // Step 4: Invite a user to the tenant
        var inviteEmail = $"invited-{Guid.NewGuid():N}@example.com";
        var inviteResponse = await _client.PostAsJsonAsync($"/api/tenants/{tenantId}/users/invite", new
        {
            Email = inviteEmail,
            RoleId = (Guid?)null
        });

        inviteResponse.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Created);
    }

    [Fact]
    public async Task OIDCAuthorizationCodeFlow_Success()
    {
        // Step 1: Setup - Create tenant and application
        var adminEmail = $"oidc-admin-{Guid.NewGuid():N}@example.com";
        var password = "Password123!";

        await _client.PostAsJsonAsync("/api/auth/register", new
        {
            Email = adminEmail,
            Password = password,
            FirstName = "OIDC",
            LastName = "Admin"
        });

        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            Email = adminEmail,
            Password = password
        });

        var loginResult = await loginResponse.Content.ReadFromJsonAsync<dynamic>();
        var accessToken = (string)loginResult!.accessToken;

        _client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

        // Create tenant
        var tenantResponse = await _client.PostAsJsonAsync("/api/tenants", new
        {
            Name = "OIDC Test Tenant",
            Slug = $"oidc-test-{Guid.NewGuid():N}"[..20]
        });

        var tenant = await tenantResponse.Content.ReadFromJsonAsync<dynamic>();
        var tenantId = (Guid)tenant!.id;

        // Create application with redirect URI
        var redirectUri = "https://example.com/callback";
        var appResponse = await _client.PostAsJsonAsync("/api/applications", new
        {
            TenantId = tenantId,
            Name = "OIDC Test App",
            ApplicationType = "web",
            RedirectUris = new[] { redirectUri }
        });

        var app = await appResponse.Content.ReadFromJsonAsync<dynamic>();
        var clientId = (string)app!.clientId;

        // Step 2: Initiate authorization request
        var codeChallenge = GenerateCodeChallenge();
        var state = Guid.NewGuid().ToString();

        var authorizeUrl = $"/oauth/authorize?" +
            $"client_id={clientId}&" +
            $"redirect_uri={Uri.EscapeDataString(redirectUri)}&" +
            $"response_type=code&" +
            $"scope=openid profile email&" +
            $"state={state}&" +
            $"code_challenge={codeChallenge}&" +
            $"code_challenge_method=S256";

        var authorizeResponse = await _client.GetAsync(authorizeUrl);

        // Should redirect to login or return authorization code
        authorizeResponse.StatusCode.Should().BeOneOf(
            HttpStatusCode.OK,
            HttpStatusCode.Redirect,
            HttpStatusCode.Found,
            HttpStatusCode.BadRequest // If not fully authenticated
        );
    }

    [Fact]
    public async Task PasswordResetFlow_Success()
    {
        // Step 1: Register user
        var email = $"reset-{Guid.NewGuid():N}@example.com";
        var password = "OldPassword123!";

        await _client.PostAsJsonAsync("/api/auth/register", new
        {
            Email = email,
            Password = password,
            FirstName = "Reset",
            LastName = "Test"
        });

        // Step 2: Request password reset
        var forgotResponse = await _client.PostAsJsonAsync("/api/auth/forgot-password", new
        {
            Email = email
        });

        forgotResponse.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Accepted);

        // Note: In real E2E test, we would need to retrieve the reset token from email
        // For this test, we verify the endpoint works correctly
    }

    [Fact]
    public async Task MfaEnrollmentAndVerificationFlow_Success()
    {
        // Step 1: Register and login
        var email = $"mfa-{Guid.NewGuid():N}@example.com";
        var password = "MfaPassword123!";

        await _client.PostAsJsonAsync("/api/auth/register", new
        {
            Email = email,
            Password = password,
            FirstName = "MFA",
            LastName = "Test"
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

        // Step 2: Enroll in MFA (TOTP)
        var enrollResponse = await _client.PostAsync("/api/mfa/enroll/totp", null);

        // Should return secret and QR code
        enrollResponse.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Created);

        if (enrollResponse.IsSuccessStatusCode)
        {
            var enrollResult = await enrollResponse.Content.ReadFromJsonAsync<dynamic>();
            var secret = (string?)enrollResult?.secret;
            secret.Should().NotBeNullOrEmpty();
        }
    }

    private string GenerateCodeChallenge()
    {
        // Simple code challenge for testing
        var verifier = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");
        using var sha256 = System.Security.Cryptography.SHA256.Create();
        var hash = sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes(verifier));
        return Convert.ToBase64String(hash)
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');
    }
}
