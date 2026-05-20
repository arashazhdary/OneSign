using Onesign.Shared.Sms;

namespace Onesign.Api.Extensions;

public static class SmsServiceExtensions
{
    public static IServiceCollection AddOnesignSmsServices(
        this IServiceCollection services,
        IConfiguration configuration,
        IHostEnvironment environment)
    {
        var provider = configuration["Sms:Provider"];
        if (string.IsNullOrWhiteSpace(provider))
        {
            provider = environment.IsDevelopment() ? SmsProviders.Logging : SmsProviders.Null;
        }

        var normalized = provider.Trim();
        if (normalized.Equals(SmsProviders.Twilio, StringComparison.OrdinalIgnoreCase))
        {
            services.AddHttpClient<TwilioSmsService>();
            services.AddScoped<ISmsService, TwilioSmsService>();
        }
        else if (normalized.Equals(SmsProviders.Logging, StringComparison.OrdinalIgnoreCase))
        {
            services.AddScoped<ISmsService, LoggingSmsService>();
        }
        else
        {
            services.AddScoped<ISmsService, NullSmsService>();
        }

        return services;
    }
}
