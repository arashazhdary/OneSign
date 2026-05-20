using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Onesign.Sdk.AspNetCore;

public static class OnesignAuthenticationExtensions
{
    /// <summary>
    /// Adds JWT bearer authentication for OneSign access tokens with claims normalization.
    /// </summary>
    public static IServiceCollection AddOnesignAuthentication(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        return services.AddOnesignAuthentication(configuration, _ => { });
    }

    /// <summary>
    /// Adds JWT bearer authentication for OneSign access tokens with claims normalization.
    /// </summary>
    public static IServiceCollection AddOnesignAuthentication(
        this IServiceCollection services,
        IConfiguration configuration,
        Action<OnesignAuthenticationOptions> configure)
    {
        services.Configure<OnesignAuthenticationOptions>(configuration.GetSection(OnesignAuthenticationOptions.SectionName));
        services.Configure(configure);
        services.AddSingleton<IClaimsTransformation, OnesignClaimsTransformation>();

        services.AddSingleton<IPostConfigureOptions<JwtBearerOptions>, ConfigureOnesignJwtBearerOptions>();
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme);

        services.AddAuthorization();
        return services;
    }

    /// <summary>
    /// Enables authentication and authorization middleware.
    /// </summary>
    public static IApplicationBuilder UseOnesignAuthentication(this IApplicationBuilder app)
    {
        app.UseAuthentication();
        app.UseAuthorization();
        return app;
    }

    internal static void ConfigureJwtBearer(JwtBearerOptions options, OnesignAuthenticationOptions onesign)
    {
        var issuer = onesign.ResolveIssuer();
        var audience = onesign.ResolveAudience();

        options.RequireHttpsMetadata = issuer.StartsWith("https://", StringComparison.OrdinalIgnoreCase);
        options.SaveToken = true;

        var useSymmetricKey = !string.IsNullOrWhiteSpace(onesign.SigningKey);

        if (!string.IsNullOrEmpty(issuer) && !useSymmetricKey)
        {
            options.Authority = issuer;
            options.MetadataAddress = $"{issuer}/.well-known/openid-configuration";
        }

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = onesign.ValidateIssuer && !string.IsNullOrEmpty(issuer),
            ValidIssuer = string.IsNullOrEmpty(issuer) ? null : issuer,
            ValidateAudience = onesign.ValidateAudience && !string.IsNullOrEmpty(audience),
            ValidAudience = string.IsNullOrEmpty(audience) ? null : audience,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = useSymmetricKey,
            ClockSkew = onesign.ClockSkew,
            NameClaimType = ClaimTypes.NameIdentifier,
            RoleClaimType = ClaimTypes.Role,
        };

        if (useSymmetricKey)
        {
            options.TokenValidationParameters.IssuerSigningKey =
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(onesign.SigningKey!));
        }

        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = context =>
            {
                if (context.Principal != null)
                {
                    context.Principal = OnesignClaimsNormalizer.Normalize(context.Principal);
                }

                return Task.CompletedTask;
            },
        };
    }
}
