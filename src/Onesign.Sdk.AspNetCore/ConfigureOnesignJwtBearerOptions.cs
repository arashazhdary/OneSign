using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;

namespace Onesign.Sdk.AspNetCore;

internal sealed class ConfigureOnesignJwtBearerOptions : IPostConfigureOptions<JwtBearerOptions>
{
    private readonly IOptions<OnesignAuthenticationOptions> _onesignOptions;

    public ConfigureOnesignJwtBearerOptions(IOptions<OnesignAuthenticationOptions> onesignOptions)
    {
        _onesignOptions = onesignOptions;
    }

    public void PostConfigure(string? name, JwtBearerOptions options)
    {
        if (name == JwtBearerDefaults.AuthenticationScheme)
        {
            OnesignAuthenticationExtensions.ConfigureJwtBearer(options, _onesignOptions.Value);
        }
    }
}
