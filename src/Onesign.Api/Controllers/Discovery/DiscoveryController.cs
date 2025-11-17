using Microsoft.AspNetCore.Mvc;

namespace Onesign.Api.Controllers.Discovery;

[ApiController]
public class DiscoveryController : ControllerBase
{
    [HttpGet(".well-known/openid-configuration")]
    public ActionResult GetOpenIdConfiguration([FromQuery] string? tenant)
    {
        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        var issuer = tenant != null ? $"{baseUrl}/{tenant}" : baseUrl;
        
        var config = new
        {
            issuer = issuer,
            authorization_endpoint = $"{baseUrl}/connect/authorize",
            token_endpoint = $"{baseUrl}/connect/token",
            userinfo_endpoint = $"{baseUrl}/connect/userinfo",
            jwks_uri = $"{baseUrl}/.well-known/jwks.json",
            response_types_supported = new[] { "code" },
            subject_types_supported = new[] { "public" },
            id_token_signing_alg_values_supported = new[] { "HS256" },
            scopes_supported = new[] { "openid", "profile", "email" },
            code_challenge_methods_supported = new[] { "S256" },
            grant_types_supported = new[] { "authorization_code" }
        };

        return Ok(config);
    }
}

