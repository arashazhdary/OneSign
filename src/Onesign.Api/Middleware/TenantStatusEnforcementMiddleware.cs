using System.Net;
using System.Text.Json;
using Onesign.Modules.Tenants.Domain.Enums;
using Onesign.Modules.Tenants.Domain.Repositories;
using Onesign.Shared.MultiTenancy;

namespace Onesign.Api.Middleware;

/// <summary>
/// Middleware that enforces tenant status restrictions and blocks requests for suspended/inactive tenants.
/// Provides granular control over which operations are allowed based on tenant status.
/// </summary>
public class TenantStatusEnforcementMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<TenantStatusEnforcementMiddleware> _logger;

    private static readonly HashSet<string> PublicEndpoints = new(StringComparer.OrdinalIgnoreCase)
    {
        "/swagger",
        "/health",
        "/ready",
        "/.well-known",
        "/api/auth/login",
        "/api/auth/register",
        "/connect/token",
        "/connect/authorize"
    };

    private static readonly HashSet<string> SuspendedAllowedEndpoints = new(StringComparer.OrdinalIgnoreCase)
    {
        "/api/billing",
        "/api/tenant/billing",
        "/api/admin"
    };

    public TenantStatusEnforcementMiddleware(RequestDelegate next, ILogger<TenantStatusEnforcementMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(
        HttpContext context,
        ITenantRepository tenantRepository,
        ITenantContextAccessor tenantContextAccessor)
    {
        var path = context.Request.Path;

        if (IsPublicEndpoint(path))
        {
            await _next(context);
            return;
        }

        var tenantId = tenantContextAccessor.GetCurrentTenantId();

        if (!tenantId.HasValue)
        {
            await _next(context);
            return;
        }

        var tenant = await tenantRepository.GetByIdAsync(tenantId.Value);

        if (tenant == null)
        {
            _logger.LogWarning("Tenant {TenantId} not found during status enforcement", tenantId);
            await WriteErrorResponse(context, HttpStatusCode.NotFound, "TENANT_NOT_FOUND", "Tenant not found");
            return;
        }

        var enforcementResult = EnforceTenantStatus(tenant.Status, path, context.Request.Method);

        if (!enforcementResult.IsAllowed)
        {
            _logger.LogWarning(
                "Access denied for tenant {TenantId} ({TenantName}) with status {Status}. Endpoint: {Path}, Method: {Method}",
                tenant.Id, tenant.Name, tenant.Status, path, context.Request.Method);

            await WriteStatusEnforcementResponse(context, tenant, enforcementResult);
            return;
        }

        context.Items["TenantStatus"] = tenant.Status.ToString();
        context.Items["TenantEnforcementLevel"] = enforcementResult.EnforcementLevel;

        await _next(context);
    }

    private static bool IsPublicEndpoint(PathString path)
    {
        return PublicEndpoints.Any(p => path.StartsWithSegments(p, StringComparison.OrdinalIgnoreCase));
    }

    private static EnforcementResult EnforceTenantStatus(TenantStatus status, PathString path, string method)
    {
        switch (status)
        {
            case TenantStatus.Active:
                return EnforcementResult.Allowed("none");

            case TenantStatus.Suspended:
                if (IsSuspendedAllowedEndpoint(path))
                {
                    return EnforcementResult.Allowed("suspended_limited");
                }

                if (method == "GET")
                {
                    return EnforcementResult.Denied(
                        HttpStatusCode.Forbidden,
                        "TENANT_SUSPENDED",
                        "This tenant account has been suspended. Read-only access is disabled. Please contact support or update billing.",
                        "suspended_blocked");
                }

                return EnforcementResult.Denied(
                    HttpStatusCode.Forbidden,
                    "TENANT_SUSPENDED",
                    "This tenant account has been suspended. All operations are disabled. Please contact support or update billing.",
                    "suspended_blocked");

            case TenantStatus.Inactive:
                if (path.StartsWithSegments("/api/admin", StringComparison.OrdinalIgnoreCase))
                {
                    return EnforcementResult.Allowed("inactive_admin_only");
                }

                return EnforcementResult.Denied(
                    HttpStatusCode.Forbidden,
                    "TENANT_INACTIVE",
                    "This tenant account is inactive. Please contact your administrator to reactivate.",
                    "inactive_blocked");

            default:
                return EnforcementResult.Denied(
                    HttpStatusCode.Forbidden,
                    "TENANT_STATUS_UNKNOWN",
                    "Unable to determine tenant status. Please contact support.",
                    "unknown_blocked");
        }
    }

    private static bool IsSuspendedAllowedEndpoint(PathString path)
    {
        return SuspendedAllowedEndpoints.Any(p => path.StartsWithSegments(p, StringComparison.OrdinalIgnoreCase));
    }

    private static async Task WriteErrorResponse(HttpContext context, HttpStatusCode statusCode, string errorCode, string message)
    {
        context.Response.StatusCode = (int)statusCode;
        context.Response.ContentType = "application/json";

        var response = JsonSerializer.Serialize(new
        {
            errorCode,
            errorMessage = message
        });

        await context.Response.WriteAsync(response);
    }

    private static async Task WriteStatusEnforcementResponse(
        HttpContext context,
        Onesign.Modules.Tenants.Domain.Entities.Tenant tenant,
        EnforcementResult result)
    {
        context.Response.StatusCode = (int)result.StatusCode;
        context.Response.ContentType = "application/json";

        var response = JsonSerializer.Serialize(new
        {
            errorCode = result.ErrorCode,
            errorMessage = result.Message,
            tenantId = tenant.Id,
            tenantName = tenant.Name,
            status = tenant.Status.ToString(),
            enforcementLevel = result.EnforcementLevel,
            supportUrl = "https://support.onesign.io",
            billingUrl = $"https://billing.onesign.io/tenant/{tenant.Id}"
        });

        await context.Response.WriteAsync(response);
    }

    private class EnforcementResult
    {
        public bool IsAllowed { get; private set; }
        public HttpStatusCode StatusCode { get; private set; }
        public string ErrorCode { get; private set; } = string.Empty;
        public string Message { get; private set; } = string.Empty;
        public string EnforcementLevel { get; private set; } = string.Empty;

        public static EnforcementResult Allowed(string enforcementLevel)
        {
            return new EnforcementResult
            {
                IsAllowed = true,
                EnforcementLevel = enforcementLevel
            };
        }

        public static EnforcementResult Denied(HttpStatusCode statusCode, string errorCode, string message, string enforcementLevel)
        {
            return new EnforcementResult
            {
                IsAllowed = false,
                StatusCode = statusCode,
                ErrorCode = errorCode,
                Message = message,
                EnforcementLevel = enforcementLevel
            };
        }
    }
}
