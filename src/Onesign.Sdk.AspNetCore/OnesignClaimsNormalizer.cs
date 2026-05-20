using System.Security.Claims;

namespace Onesign.Sdk.AspNetCore;

/// <summary>
/// Maps OneSign JWT claims to standard ASP.NET Core claim types.
/// </summary>
public static class OnesignClaimsNormalizer
{
    public static ClaimsPrincipal Normalize(ClaimsPrincipal principal)
    {
        if (principal.Identity is not ClaimsIdentity identity)
        {
            return principal;
        }

        var claims = identity.Claims.ToList();
        AddMapped(claims, identity, "sub", ClaimTypes.NameIdentifier, OnesignClaimTypes.Subject);
        AddMapped(claims, identity, "email", ClaimTypes.Email, ClaimTypes.Email);
        AddMapped(claims, identity, "name", ClaimTypes.Name, ClaimTypes.Name);
        AddMapped(claims, identity, "tenant_id", OnesignClaimTypes.TenantId, OnesignClaimTypes.TenantId);
        AddMapped(claims, identity, "client_id", OnesignClaimTypes.ClientId, OnesignClaimTypes.ClientId);

        foreach (var role in claims.Where(c => c.Type is "role" or "roles").Select(c => c.Value))
        {
            if (!identity.HasClaim(ClaimTypes.Role, role))
            {
                identity.AddClaim(new Claim(ClaimTypes.Role, role));
            }
        }

        foreach (var permission in claims.Where(c => c.Type == "permission"))
        {
            if (!identity.HasClaim(OnesignClaimTypes.Permission, permission.Value))
            {
                identity.AddClaim(new Claim(OnesignClaimTypes.Permission, permission.Value));
            }
        }

        foreach (var orgUnit in claims.Where(c => c.Type is "org_unit_id" or "org_unit_ids" or "primary_org_unit"))
        {
            if (!identity.HasClaim(OnesignClaimTypes.OrgUnitId, orgUnit.Value))
            {
                identity.AddClaim(new Claim(OnesignClaimTypes.OrgUnitId, orgUnit.Value));
            }
        }

        return principal;
    }

    private static void AddMapped(
        List<Claim> existing,
        ClaimsIdentity identity,
        string sourceType,
        string targetType,
        string aliasType)
    {
        var source = existing.FirstOrDefault(c => c.Type == sourceType);
        if (source == null)
        {
            return;
        }

        if (!identity.HasClaim(targetType, source.Value))
        {
            identity.AddClaim(new Claim(targetType, source.Value));
        }

        if (aliasType != targetType && !identity.HasClaim(aliasType, source.Value))
        {
            identity.AddClaim(new Claim(aliasType, source.Value));
        }
    }
}
