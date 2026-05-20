using System.Security.Claims;
using FluentAssertions;
using Onesign.Sdk.AspNetCore;
using Xunit;

namespace Onesign.Api.Tests.Sdk;

public class OnesignClaimsNormalizerTests
{
    [Fact]
    public void Normalize_MapsStandardAndTenantClaims()
    {
        var identity = new ClaimsIdentity(new[]
        {
            new Claim("sub", "user-1"),
            new Claim("email", "a@b.com"),
            new Claim("tenant_id", "tenant-9"),
            new Claim("client_id", "client-2"),
            new Claim("role", "Admin"),
            new Claim("permission", "users.read"),
        }, "Bearer");

        var principal = OnesignClaimsNormalizer.Normalize(new ClaimsPrincipal(identity));

        principal.FindFirst(ClaimTypes.NameIdentifier)!.Value.Should().Be("user-1");
        principal.FindFirst(ClaimTypes.Email)!.Value.Should().Be("a@b.com");
        principal.FindFirst(OnesignClaimTypes.TenantId)!.Value.Should().Be("tenant-9");
        principal.FindFirst(OnesignClaimTypes.ClientId)!.Value.Should().Be("client-2");
        principal.FindAll(ClaimTypes.Role).Select(c => c.Value).Should().Contain("Admin");
        principal.FindFirst(OnesignClaimTypes.Permission)!.Value.Should().Be("users.read");
    }
}
