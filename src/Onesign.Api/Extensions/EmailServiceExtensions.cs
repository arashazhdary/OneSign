using Onesign.Shared.Email;

namespace Onesign.Api.Extensions;

public static class EmailServiceExtensions
{
    public static IServiceCollection AddOnesignEmailServices(this IServiceCollection services, IConfiguration configuration)
    {
        var provider = (configuration["Email:Provider"] ?? InferProvider(configuration)).Trim();

        switch (provider.ToLowerInvariant())
        {
            case "smtp":
                services.AddScoped<IEmailService, SmtpEmailService>();
                break;
            case "sendgrid":
                services.AddHttpClient(nameof(SendGridEmailService));
                services.AddScoped<IEmailService, SendGridEmailService>();
                break;
            case "null":
            case "none":
                services.AddScoped<IEmailService, NullEmailService>();
                break;
            default:
                services.AddScoped<IEmailService, NullEmailService>();
                break;
        }

        return services;
    }

    private static string InferProvider(IConfiguration configuration)
    {
        if (!string.IsNullOrWhiteSpace(configuration["Email:SendGrid:ApiKey"]))
            return "SendGrid";
        if (!string.IsNullOrWhiteSpace(configuration["Email:Smtp:Host"]))
            return "Smtp";
        return "Null";
    }
}
