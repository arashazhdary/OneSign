using Onesign.Shared.Localization;

namespace Onesign.Api.Middleware;

public class LocalizationMiddleware
{
    private readonly RequestDelegate _next;

    public LocalizationMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, ILocalizationService localizationService)
    {
        var acceptLanguage = context.Request.Headers["Accept-Language"].FirstOrDefault();
        var culture = localizationService.GetCultureFromHeader(acceptLanguage);
        context.Items["Culture"] = culture;
        
        await _next(context);
    }
}

