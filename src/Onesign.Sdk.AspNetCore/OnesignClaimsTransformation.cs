using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;

namespace Onesign.Sdk.AspNetCore;

internal sealed class OnesignClaimsTransformation : IClaimsTransformation
{
    public Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        return Task.FromResult(OnesignClaimsNormalizer.Normalize(principal));
    }
}
