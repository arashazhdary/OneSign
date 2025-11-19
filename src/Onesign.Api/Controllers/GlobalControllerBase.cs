using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Onesign.Api.Controllers;

[ApiController]
public abstract class GlobalControllerBase : ControllerBase
{
    /// <summary>
    /// Gets the current authenticated user's ID from JWT claims
    /// </summary>
    protected Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Guid.Empty;
        }

        return userId;
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
