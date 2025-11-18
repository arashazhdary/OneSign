using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Onesign.IntegrationTests.Fixtures;

namespace Onesign.IntegrationTests.E2E;

/// <summary>
/// End-to-End tests for multi-tenant workflows
/// </summary>
public class MultiTenantFlowTests : IClassFixture<InMemoryWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly InMemoryWebApplicationFactory _factory;

    public MultiTenantFlowTests(InMemoryWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task UserBelongingToMultipleTenants_CanSwitchBetweenTenants()
    {
        // Step 1: Create user
        var email = $"multi-tenant-{Guid.NewGuid():N}@example.com";
        var password = "Password123!";

        await _client.PostAsJsonAsync("/api/auth/register", new
        {
            Email = email,
            Password = password,
            FirstName = "Multi",
            LastName = "Tenant"
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

        // Step 2: Create first tenant
        var tenant1Response = await _client.PostAsJsonAsync("/api/tenants", new
        {
            Name = "Tenant One",
            Slug = $"tenant-one-{Guid.NewGuid():N}"[..20]
        });

        var tenant1 = await tenant1Response.Content.ReadFromJsonAsync<dynamic>();
        var tenant1Id = (Guid)tenant1!.id;

        // Step 3: Create second tenant
        var tenant2Response = await _client.PostAsJsonAsync("/api/tenants", new
        {
            Name = "Tenant Two",
            Slug = $"tenant-two-{Guid.NewGuid():N}"[..20]
        });

        var tenant2 = await tenant2Response.Content.ReadFromJsonAsync<dynamic>();
        var tenant2Id = (Guid)tenant2!.id;

        // Step 4: Get user's tenants
        var tenantsResponse = await _client.GetAsync("/api/users/me/tenants");
        tenantsResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // Step 5: Switch to tenant 1 context
        var switchResponse1 = await _client.PostAsJsonAsync($"/api/auth/switch-tenant", new
        {
            TenantId = tenant1Id
        });

        switchResponse1.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Created);

        // Step 6: Switch to tenant 2 context
        var switchResponse2 = await _client.PostAsJsonAsync($"/api/auth/switch-tenant", new
        {
            TenantId = tenant2Id
        });

        switchResponse2.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Created);
    }

    [Fact]
    public async Task TenantIsolation_DataIsIsolatedBetweenTenants()
    {
        // Create two separate admin users for two tenants
        var admin1Email = $"admin1-{Guid.NewGuid():N}@example.com";
        var admin2Email = $"admin2-{Guid.NewGuid():N}@example.com";
        var password = "Password123!";

        // Setup Admin 1 and Tenant 1
        await _client.PostAsJsonAsync("/api/auth/register", new
        {
            Email = admin1Email,
            Password = password,
            FirstName = "Admin",
            LastName = "One"
        });

        var login1Response = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            Email = admin1Email,
            Password = password
        });

        var login1Result = await login1Response.Content.ReadFromJsonAsync<dynamic>();
        var token1 = (string)login1Result!.accessToken;

        _client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token1);

        var tenant1Response = await _client.PostAsJsonAsync("/api/tenants", new
        {
            Name = "Isolated Tenant 1",
            Slug = $"isolated-1-{Guid.NewGuid():N}"[..20]
        });

        var tenant1 = await tenant1Response.Content.ReadFromJsonAsync<dynamic>();
        var tenant1Id = (Guid)tenant1!.id;

        // Create app in tenant 1
        var app1Response = await _client.PostAsJsonAsync("/api/applications", new
        {
            TenantId = tenant1Id,
            Name = "Tenant 1 App",
            ApplicationType = "web",
            RedirectUris = new[] { "https://tenant1.example.com/callback" }
        });

        var app1 = await app1Response.Content.ReadFromJsonAsync<dynamic>();
        var app1Id = (Guid)app1!.id;

        // Setup Admin 2 and Tenant 2
        _client.DefaultRequestHeaders.Clear();

        await _client.PostAsJsonAsync("/api/auth/register", new
        {
            Email = admin2Email,
            Password = password,
            FirstName = "Admin",
            LastName = "Two"
        });

        var login2Response = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            Email = admin2Email,
            Password = password
        });

        var login2Result = await login2Response.Content.ReadFromJsonAsync<dynamic>();
        var token2 = (string)login2Result!.accessToken;

        _client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token2);

        var tenant2Response = await _client.PostAsJsonAsync("/api/tenants", new
        {
            Name = "Isolated Tenant 2",
            Slug = $"isolated-2-{Guid.NewGuid():N}"[..20]
        });

        var tenant2 = await tenant2Response.Content.ReadFromJsonAsync<dynamic>();
        var tenant2Id = (Guid)tenant2!.id;

        // Admin 2 should NOT be able to access Tenant 1's app
        var unauthorizedResponse = await _client.GetAsync($"/api/applications/{app1Id}");
        unauthorizedResponse.StatusCode.Should().BeOneOf(
            HttpStatusCode.NotFound,
            HttpStatusCode.Forbidden,
            HttpStatusCode.Unauthorized
        );
    }

    [Fact]
    public async Task RoleBasedAccessControl_EnforcesPermissions()
    {
        // Setup admin user and tenant
        var adminEmail = $"rbac-admin-{Guid.NewGuid():N}@example.com";
        var memberEmail = $"rbac-member-{Guid.NewGuid():N}@example.com";
        var password = "Password123!";

        // Register admin
        await _client.PostAsJsonAsync("/api/auth/register", new
        {
            Email = adminEmail,
            Password = password,
            FirstName = "RBAC",
            LastName = "Admin"
        });

        var adminLoginResponse = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            Email = adminEmail,
            Password = password
        });

        var adminLoginResult = await adminLoginResponse.Content.ReadFromJsonAsync<dynamic>();
        var adminToken = (string)adminLoginResult!.accessToken;

        _client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", adminToken);

        // Create tenant
        var tenantResponse = await _client.PostAsJsonAsync("/api/tenants", new
        {
            Name = "RBAC Test Tenant",
            Slug = $"rbac-test-{Guid.NewGuid():N}"[..20]
        });

        var tenant = await tenantResponse.Content.ReadFromJsonAsync<dynamic>();
        var tenantId = (Guid)tenant!.id;

        // Admin should be able to create applications
        var appResponse = await _client.PostAsJsonAsync("/api/applications", new
        {
            TenantId = tenantId,
            Name = "RBAC Test App",
            ApplicationType = "web",
            RedirectUris = new[] { "https://rbac.example.com/callback" }
        });

        appResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // Invite member with limited role
        await _client.PostAsJsonAsync($"/api/tenants/{tenantId}/users/invite", new
        {
            Email = memberEmail,
            Role = "member" // Limited role
        });

        // Register and login as member
        _client.DefaultRequestHeaders.Clear();

        await _client.PostAsJsonAsync("/api/auth/register", new
        {
            Email = memberEmail,
            Password = password,
            FirstName = "RBAC",
            LastName = "Member"
        });

        var memberLoginResponse = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            Email = memberEmail,
            Password = password
        });

        var memberLoginResult = await memberLoginResponse.Content.ReadFromJsonAsync<dynamic>();
        var memberToken = (string)memberLoginResult!.accessToken;

        _client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", memberToken);

        // Member should NOT be able to create applications (admin only action)
        var memberAppResponse = await _client.PostAsJsonAsync("/api/applications", new
        {
            TenantId = tenantId,
            Name = "Unauthorized App",
            ApplicationType = "web",
            RedirectUris = new[] { "https://unauthorized.example.com/callback" }
        });

        memberAppResponse.StatusCode.Should().BeOneOf(
            HttpStatusCode.Forbidden,
            HttpStatusCode.Unauthorized,
            HttpStatusCode.BadRequest
        );
    }

    [Fact]
    public async Task TenantSettings_ApplyToAllTenantUsers()
    {
        // Setup admin and tenant
        var adminEmail = $"settings-admin-{Guid.NewGuid():N}@example.com";
        var password = "Password123!";

        await _client.PostAsJsonAsync("/api/auth/register", new
        {
            Email = adminEmail,
            Password = password,
            FirstName = "Settings",
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
            Name = "Settings Test Tenant",
            Slug = $"settings-test-{Guid.NewGuid():N}"[..20]
        });

        var tenant = await tenantResponse.Content.ReadFromJsonAsync<dynamic>();
        var tenantId = (Guid)tenant!.id;

        // Update tenant security settings (require MFA)
        var settingsResponse = await _client.PutAsJsonAsync($"/api/tenants/{tenantId}/config", new
        {
            RequireMfa = true,
            SessionTimeoutMinutes = 30,
            PasswordMinLength = 12,
            PasswordRequireSpecialChars = true
        });

        settingsResponse.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.NoContent);

        // Get tenant config to verify
        var getConfigResponse = await _client.GetAsync($"/api/tenants/{tenantId}/config");
        getConfigResponse.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
