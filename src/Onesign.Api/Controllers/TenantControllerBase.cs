using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Onesign.Api.Controllers;

[ApiController]
public abstract class TenantControllerBase : ControllerBase
{
    /// <summary>
    /// Gets the current authenticated user's TenantUserId from JWT claims
    /// </summary>
    protected Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            // For development/testing: return Empty if not authenticated
            // In production: throw new UnauthorizedAccessException("User not authenticated");
            return Guid.Empty;
        }

        return userId;
    }

    /// <summary>
    /// Gets the current tenant ID from JWT claims
    /// </summary>
    protected Guid GetCurrentTenantId()
    {
        var tenantIdClaim = User.FindFirst("tenant_id")?.Value;

        if (string.IsNullOrEmpty(tenantIdClaim) || !Guid.TryParse(tenantIdClaim, out var tenantId))
        {
            return Guid.Empty;
        }

        return tenantId;
    }

    /// <summary>
    /// Gets the culture from Accept-Language header
    /// </summary>
    protected System.Globalization.CultureInfo GetCulture()
    {
        try
        {
            var acceptLanguage = Request.Headers["Accept-Language"].FirstOrDefault() ?? "en";
            // Parse Accept-Language header which can be like "en-US,en;q=0.9,fa;q=0.8"
            // Take only the first language code before any comma or semicolon
            var cultureName = acceptLanguage.Split(',', ';')[0].Trim();
            if (string.IsNullOrEmpty(cultureName))
                cultureName = "en";
            return new System.Globalization.CultureInfo(cultureName);
        }
        catch
        {
            // Fallback to English if culture parsing fails
            return System.Globalization.CultureInfo.InvariantCulture;
        }
    }
}
