using System.Net;
using System.Text.Json;
using Onesign.Modules.Tenants.Domain.Enums;
using Onesign.Modules.Tenants.Domain.Repositories;
using Onesign.Shared.MultiTenancy;

namespace Onesign.Api.Middleware;

/// <summary>
/// Middleware that checks tenant status and returns appropriate responses for suspended or maintenance mode tenants
/// </summary>
public class TenantStatusMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<TenantStatusMiddleware> _logger;

    public TenantStatusMiddleware(RequestDelegate next, ILogger<TenantStatusMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(
        HttpContext context,
        ITenantRepository tenantRepository,
        ITenantContextAccessor tenantContextAccessor)
    {
        // Skip status check for public endpoints
        if (IsPublicEndpoint(context.Request.Path))
        {
            await _next(context);
            return;
        }

        var tenantId = tenantContextAccessor.GetCurrentTenantId();

        if (!tenantId.HasValue)
        {
            // No tenant context, continue
            await _next(context);
            return;
        }

        var tenant = await tenantRepository.GetByIdAsync(tenantId.Value);

        if (tenant == null)
        {
            await _next(context);
            return;
        }

        // Check tenant status
        switch (tenant.Status)
        {
            case TenantStatus.Suspended:
                _logger.LogWarning("Access denied for suspended tenant {TenantId}", tenant.Id);
                await WriteForbiddenResponse(context, tenant);
                return;

            case TenantStatus.Inactive:
                // Check if this is a maintenance window
                if (IsMaintenanceMode(context, tenantId.Value))
                {
                    _logger.LogInformation("Tenant {TenantId} is in maintenance mode", tenant.Id);
                    await WriteMaintenanceResponse(context, tenant);
                    return;
                }

                _logger.LogWarning("Access denied for inactive tenant {TenantId}", tenant.Id);
                await WriteForbiddenResponse(context, tenant);
                return;

            case TenantStatus.Active:
                // Check for scheduled maintenance
                if (IsMaintenanceMode(context, tenantId.Value))
                {
                    await WriteMaintenanceResponse(context, tenant);
                    return;
                }
                break;
        }

        await _next(context);
    }

    private static bool IsPublicEndpoint(PathString path)
    {
        var publicPaths = new[]
        {
            "/swagger",
            "/health",
            "/ready",
            "/.well-known"
        };

        return publicPaths.Any(p => path.StartsWithSegments(p, StringComparison.OrdinalIgnoreCase));
    }

    private static bool IsMaintenanceMode(HttpContext context, Guid tenantId)
    {
        // Check for maintenance mode flag in HttpContext items
        // This would typically be set by a configuration check or scheduled maintenance window
        if (context.Items.TryGetValue($"MaintenanceMode:{tenantId}", out var maintenanceModeObj))
        {
            return maintenanceModeObj is true;
        }

        // Could also check against a configuration or database for scheduled maintenance windows
        return false;
    }

    private static async Task WriteForbiddenResponse(HttpContext context, Onesign.Modules.Tenants.Domain.Entities.Tenant tenant)
    {
        context.Response.StatusCode = (int)HttpStatusCode.Forbidden;
        context.Response.ContentType = "application/json";

        var errorCode = tenant.Status == TenantStatus.Suspended ? "TENANT_SUSPENDED" : "TENANT_INACTIVE";
        var message = tenant.Status == TenantStatus.Suspended
            ? "This tenant account has been suspended. Please contact support."
            : "This tenant account is currently inactive.";

        var response = JsonSerializer.Serialize(new
        {
            errorCode,
            errorMessage = message,
            tenantId = tenant.Id,
            tenantName = tenant.Name,
            status = tenant.Status.ToString()
        });

        await context.Response.WriteAsync(response);
    }

    private static async Task WriteMaintenanceResponse(HttpContext context, Onesign.Modules.Tenants.Domain.Entities.Tenant tenant)
    {
        context.Response.StatusCode = (int)HttpStatusCode.ServiceUnavailable;
        context.Response.ContentType = "application/json";

        // Set Retry-After header (default 30 minutes)
        context.Response.Headers["Retry-After"] = "1800";

        var response = JsonSerializer.Serialize(new
        {
            errorCode = "MAINTENANCE_MODE",
            errorMessage = "This tenant is currently undergoing maintenance. Please try again later.",
            tenantId = tenant.Id,
            tenantName = tenant.Name,
            retryAfter = 1800
        });

        await context.Response.WriteAsync(response);
    }
}
