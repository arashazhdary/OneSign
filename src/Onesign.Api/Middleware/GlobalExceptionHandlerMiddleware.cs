using Onesign.Shared.Exceptions;
using Onesign.Shared.Localization;
using System.Net;
using System.Text.Json;

namespace Onesign.Api.Middleware;

public class GlobalExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;

    public GlobalExceptionHandlerMiddleware(RequestDelegate next, ILogger<GlobalExceptionHandlerMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, ILocalizationService localizationService)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex, localizationService);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception, ILocalizationService localizationService)
    {
        context.Response.ContentType = "application/json";
        var culture = context.Items["Culture"]?.ToString() ?? "en";

        var response = exception switch
        {
            BusinessException businessEx => new
            {
                errorCode = businessEx.ErrorCode ?? "BUSINESS_ERROR",
                errorMessage = localizationService.GetString(businessEx.ErrorCode ?? "BUSINESS_ERROR", culture),
                details = businessEx.Message
            },
            _ => new
            {
                errorCode = "INTERNAL_SERVER_ERROR",
                errorMessage = localizationService.GetString("INTERNAL_SERVER_ERROR", culture),
                details = "An unexpected error occurred"
            }
        };

        context.Response.StatusCode = exception switch
        {
            BusinessException => (int)HttpStatusCode.BadRequest,
            _ => (int)HttpStatusCode.InternalServerError
        };

        var jsonResponse = JsonSerializer.Serialize(response);
        await context.Response.WriteAsync(jsonResponse);
    }
}

