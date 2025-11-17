using Microsoft.AspNetCore.Mvc;
using System.Security.Cryptography;
using System.Text;

namespace Onesign.Api.Controllers.Discovery;

[ApiController]
public class JwksController : ControllerBase
{
    [HttpGet(".well-known/jwks.json")]
    public ActionResult GetJwks()
    {
        // For Phase 1, we use HS256 (symmetric key), so we don't expose public keys
        // Note: Currently using HS256 (symmetric key). For RS256 (asymmetric), 
        // this endpoint would return the public key set (JWKS) for token validation
        // For now, return an empty keys array as HS256 doesn't require public key distribution
        var jwks = new
        {
            keys = new object[0]
        };

        return Ok(jwks);
    }
}

