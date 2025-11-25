using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using Onesign.Api.Data;

namespace Onesign.Api.Authentication;

/// <summary>
/// Development authentication handler that allows all requests.
/// This should ONLY be used in development environments.
/// </summary>
public class DevelopmentAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public DevelopmentAuthHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder)
        : base(options, logger, encoder)
    {
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        // Use well-known test user IDs from DatabaseSeeder
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, DatabaseSeeder.TestAdminUserId.ToString()),
            new Claim(ClaimTypes.Name, "Test Admin User"),
            new Claim(ClaimTypes.Email, "admin@test.local"),
            new Claim("sub", DatabaseSeeder.TestAdminUserId.ToString()),
            new Claim("tenant_id", DatabaseSeeder.TestTenantId.ToString()),
        };

        var identity = new ClaimsIdentity(claims, Scheme.Name);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, Scheme.Name);

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}

