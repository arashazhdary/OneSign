using System.Diagnostics;
using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Onesign.IntegrationTests.Fixtures;

namespace Onesign.IntegrationTests.Performance;

/// <summary>
/// Performance and load tests for critical endpoints
/// </summary>
public class LoadTests : IClassFixture<InMemoryWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly InMemoryWebApplicationFactory _factory;

    public LoadTests(InMemoryWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task LoginEndpoint_ShouldRespondWithin500ms()
    {
        // Setup user
        var email = $"perf-login-{Guid.NewGuid():N}@example.com";
        var password = "Password123!";

        await _client.PostAsJsonAsync("/api/auth/register", new
        {
            Email = email,
            Password = password,
            FirstName = "Perf",
            LastName = "Test"
        });

        var loginRequest = new { Email = email, Password = password };

        // Measure response time
        var stopwatch = Stopwatch.StartNew();
        var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);
        stopwatch.Stop();

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(500, "Login should respond within 500ms");
    }

    [Fact]
    public async Task TenantCreation_ShouldRespondWithin1000ms()
    {
        // Setup
        var email = $"perf-tenant-{Guid.NewGuid():N}@example.com";
        var password = "Password123!";

        await _client.PostAsJsonAsync("/api/auth/register", new
        {
            Email = email,
            Password = password,
            FirstName = "Perf",
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

        // Measure tenant creation
        var tenantRequest = new
        {
            Name = "Perf Test Tenant",
            Slug = $"perf-{Guid.NewGuid():N}"[..20]
        };

        var stopwatch = Stopwatch.StartNew();
        var response = await _client.PostAsJsonAsync("/api/tenants", tenantRequest);
        stopwatch.Stop();

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(1000, "Tenant creation should respond within 1000ms");
    }

    [Fact]
    public async Task ConcurrentLogins_ShouldHandleWithoutErrors()
    {
        // Setup users
        var users = new List<(string Email, string Password)>();
        for (int i = 0; i < 10; i++)
        {
            var email = $"concurrent-{i}-{Guid.NewGuid():N}@example.com";
            var password = "Password123!";

            await _client.PostAsJsonAsync("/api/auth/register", new
            {
                Email = email,
                Password = password,
                FirstName = $"User{i}",
                LastName = "Test"
            });

            users.Add((email, password));
        }

        // Execute concurrent logins
        var tasks = users.Select(async user =>
        {
            var client = _factory.CreateClient();
            var response = await client.PostAsJsonAsync("/api/auth/login", new
            {
                Email = user.Email,
                Password = user.Password
            });
            return response.StatusCode;
        });

        var results = await Task.WhenAll(tasks);

        // Assert all logins succeeded
        results.Should().AllBeEquivalentTo(HttpStatusCode.OK);
    }

    [Fact]
    public async Task BulkUserCreation_ShouldComplete()
    {
        // Setup admin
        var adminEmail = $"bulk-admin-{Guid.NewGuid():N}@example.com";
        var password = "Password123!";

        await _client.PostAsJsonAsync("/api/auth/register", new
        {
            Email = adminEmail,
            Password = password,
            FirstName = "Bulk",
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
            Name = "Bulk Test Tenant",
            Slug = $"bulk-{Guid.NewGuid():N}"[..20]
        });

        var tenant = await tenantResponse.Content.ReadFromJsonAsync<dynamic>();
        var tenantId = (Guid)tenant!.id;

        // Measure bulk operations
        var stopwatch = Stopwatch.StartNew();

        var inviteTasks = new List<Task<HttpResponseMessage>>();
        for (int i = 0; i < 20; i++)
        {
            var task = _client.PostAsJsonAsync($"/api/tenants/{tenantId}/users/invite", new
            {
                Email = $"bulk-user-{i}-{Guid.NewGuid():N}@example.com"
            });
            inviteTasks.Add(task);
        }

        await Task.WhenAll(inviteTasks);
        stopwatch.Stop();

        // Assert
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(10000, "20 invites should complete within 10 seconds");
    }

    [Fact]
    public async Task DatabaseQueryPerformance_ListTenants()
    {
        // Setup admin
        var adminEmail = $"query-perf-{Guid.NewGuid():N}@example.com";
        var password = "Password123!";

        await _client.PostAsJsonAsync("/api/auth/register", new
        {
            Email = adminEmail,
            Password = password,
            FirstName = "Query",
            LastName = "Perf"
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

        // Create multiple tenants
        for (int i = 0; i < 10; i++)
        {
            await _client.PostAsJsonAsync("/api/tenants", new
            {
                Name = $"Query Perf Tenant {i}",
                Slug = $"query-perf-{i}-{Guid.NewGuid():N}"[..20]
            });
        }

        // Measure list query
        var stopwatch = Stopwatch.StartNew();
        var response = await _client.GetAsync("/api/tenants?page=1&pageSize=50");
        stopwatch.Stop();

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(200, "List query should respond within 200ms");
    }

    [Fact]
    public async Task TokenGeneration_ShouldBeEfficient()
    {
        // Setup user
        var email = $"token-perf-{Guid.NewGuid():N}@example.com";
        var password = "Password123!";

        await _client.PostAsJsonAsync("/api/auth/register", new
        {
            Email = email,
            Password = password,
            FirstName = "Token",
            LastName = "Perf"
        });

        var times = new List<long>();

        // Multiple token generations
        for (int i = 0; i < 5; i++)
        {
            var stopwatch = Stopwatch.StartNew();
            var response = await _client.PostAsJsonAsync("/api/auth/login", new
            {
                Email = email,
                Password = password
            });
            stopwatch.Stop();

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            times.Add(stopwatch.ElapsedMilliseconds);
        }

        // Assert average time
        var averageTime = times.Average();
        averageTime.Should().BeLessThan(300, "Average token generation should be under 300ms");
    }
}
