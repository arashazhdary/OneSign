using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.Identity.Domain.Repositories;

namespace Onesign.Api.Controllers.Discovery;

[ApiController]
[Route("connect")]
[Authorize]
public class UserInfoController : ControllerBase
{
    private readonly ITenantUserRepository _tenantUserRepository;
    private readonly IGlobalUserRepository _globalUserRepository;

    public UserInfoController(
        ITenantUserRepository tenantUserRepository,
        IGlobalUserRepository globalUserRepository)
    {
        _tenantUserRepository = tenantUserRepository;
        _globalUserRepository = globalUserRepository;
    }

    [HttpGet("userinfo")]
    public async Task<ActionResult> GetUserInfo()
    {
        // Try to get from session first, then from JWT claim
        Guid? tenantUserId = null;
        var sessionUserId = HttpContext.Session.GetString("TenantUserId");
        if (!string.IsNullOrEmpty(sessionUserId) && Guid.TryParse(sessionUserId, out var sessionUserIdGuid))
        {
            tenantUserId = sessionUserIdGuid;
        }
        
        if (!tenantUserId.HasValue)
        {
            var userIdClaim = User.FindFirst("sub")?.Value;
            if (!string.IsNullOrEmpty(userIdClaim) && Guid.TryParse(userIdClaim, out var claimUserId))
            {
                tenantUserId = claimUserId;
            }
        }
        
        if (!tenantUserId.HasValue)
        {
            return Unauthorized(new { error = "invalid_token", error_description = "Invalid or missing user claim" });
        }

        var tenantUser = await _tenantUserRepository.GetByIdAsync(tenantUserId.Value);
        if (tenantUser == null)
        {
            return Unauthorized(new { error = "invalid_token", error_description = "User not found" });
        }

        var globalUser = await _globalUserRepository.GetByIdAsync(tenantUser.GlobalUserId);
        if (globalUser == null)
        {
            return Unauthorized(new { error = "invalid_token", error_description = "Global user not found" });
        }

        return Ok(new
        {
            sub = tenantUser.Id.ToString(),
            email = globalUser.Email,
            email_verified = true,
            tenant_id = tenantUser.TenantId.ToString()
        });
    }
}

