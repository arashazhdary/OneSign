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
        var cultureName = Request.Headers["Accept-Language"].FirstOrDefault() ?? "en";
        return new System.Globalization.CultureInfo(cultureName);
    }
}
