using System.Net;
using System.Text.Json;
using Onesign.Modules.Tenants.Domain.Enums;
using Onesign.Modules.Tenants.Domain.Repositories;
using Onesign.Shared.MultiTenancy;
using Onesign.Shared.Tenant;

namespace Onesign.Api.Middleware;

/// <summary>
/// Middleware that extracts tenant context from requests and validates tenant existence and status
/// </summary>
public class TenantIsolationMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<TenantIsolationMiddleware> _logger;

    private const string TenantIdHeader = "X-Tenant-Id";
    private const string TenantSlugHeader = "X-Tenant-Slug";

    public TenantIsolationMiddleware(RequestDelegate next, ILogger<TenantIsolationMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(
        HttpContext context,
        ITenantRepository tenantRepository,
        ITenantContextAccessor tenantContextAccessor)
    {
        // Skip tenant isolation for public endpoints
        if (IsPublicEndpoint(context.Request.Path))
        {
            await _next(context);
            return;
        }

        // Try to extract tenant context from various sources
        var tenantContext = await ExtractTenantContextAsync(context, tenantRepository);

        if (tenantContext == null || !tenantContext.TenantId.HasValue)
        {
            // Check if this endpoint requires tenant context
            if (RequiresTenantContext(context.Request.Path))
            {
                await WriteErrorResponse(context, HttpStatusCode.BadRequest,
                    "TENANT_REQUIRED", "Tenant context is required for this request");
                return;
            }

            // Continue without tenant context for endpoints that don't require it
            await _next(context);
            return;
        }

        // Validate tenant exists and is active
        var tenant = await tenantRepository.GetByIdAsync(tenantContext.TenantId.Value);

        if (tenant == null)
        {
            _logger.LogWarning("Request attempted for non-existent tenant {TenantId}", tenantContext.TenantId);
            await WriteErrorResponse(context, HttpStatusCode.NotFound,
                "TENANT_NOT_FOUND", "The specified tenant does not exist");
            return;
        }

        // Check tenant status
        if (tenant.Status == TenantStatus.Inactive)
        {
            _logger.LogWarning("Request blocked for inactive tenant {TenantId}", tenant.Id);
            await WriteErrorResponse(context, HttpStatusCode.Forbidden,
                "TENANT_INACTIVE", "This tenant account is inactive");
            return;
        }

        if (tenant.Status == TenantStatus.Suspended)
        {
            _logger.LogWarning("Request blocked for suspended tenant {TenantId}", tenant.Id);
            await WriteErrorResponse(context, HttpStatusCode.Forbidden,
                "TENANT_SUSPENDED", "This tenant account has been suspended");
            return;
        }

        // Update tenant context with full details
        tenantContext.TenantSlug = tenant.Slug;

        // Set tenant context in accessor and HttpContext items
        tenantContextAccessor.SetCurrentTenant(tenantContext);
        context.Items["TenantId"] = tenant.Id;
        context.Items["TenantSlug"] = tenant.Slug;
        context.Items["TenantName"] = tenant.Name;

        _logger.LogDebug("Request processed for tenant {TenantId} ({TenantSlug})", tenant.Id, tenant.Slug);

        await _next(context);
    }

    private async Task<TenantContext?> ExtractTenantContextAsync(HttpContext context, ITenantRepository tenantRepository)
    {
        // 1. Try to extract from header (X-Tenant-Id)
        if (context.Request.Headers.TryGetValue(TenantIdHeader, out var tenantIdHeader))
        {
            if (Guid.TryParse(tenantIdHeader.FirstOrDefault(), out var tenantId))
            {
                return new TenantContext { TenantId = tenantId };
            }
        }

        // 2. Try to extract from header (X-Tenant-Slug)
        if (context.Request.Headers.TryGetValue(TenantSlugHeader, out var tenantSlugHeader))
        {
            var slug = tenantSlugHeader.FirstOrDefault();
            if (!string.IsNullOrEmpty(slug))
            {
                var tenant = await tenantRepository.GetBySlugAsync(slug);
                if (tenant != null)
                {
                    return new TenantContext { TenantId = tenant.Id, TenantSlug = tenant.Slug };
                }
            }
        }

        // 3. Try to extract from subdomain (e.g., tenant1.onesign.com)
        var host = context.Request.Host.Host;
        if (host.Contains('.'))
        {
            var subdomain = host.Split('.')[0];
            if (!string.IsNullOrEmpty(subdomain) && subdomain != "www" && subdomain != "api")
            {
                var tenant = await tenantRepository.GetBySlugAsync(subdomain);
                if (tenant != null)
                {
                    return new TenantContext { TenantId = tenant.Id, TenantSlug = tenant.Slug };
                }
            }
        }

        // 4. Try to extract from path (e.g., /api/tenants/{tenantId}/...)
        var path = context.Request.Path.Value;
        if (!string.IsNullOrEmpty(path))
        {
            var segments = path.Split('/', StringSplitOptions.RemoveEmptyEntries);
            for (int i = 0; i < segments.Length - 1; i++)
            {
                if (segments[i].Equals("tenants", StringComparison.OrdinalIgnoreCase) &&
                    Guid.TryParse(segments[i + 1], out var pathTenantId))
                {
                    return new TenantContext { TenantId = pathTenantId };
                }
            }
        }

        // 5. Try to extract from JWT claims
        var tenantIdClaim = context.User?.FindFirst("tenant_id")?.Value;
        if (!string.IsNullOrEmpty(tenantIdClaim) && Guid.TryParse(tenantIdClaim, out var claimTenantId))
        {
            return new TenantContext { TenantId = claimTenantId };
        }

        return null;
    }

    private static bool IsPublicEndpoint(PathString path)
    {
        var publicPaths = new[]
        {
            "/swagger",
            "/health",
            "/ready",
            "/.well-known",
            "/api/auth/login",
            "/api/auth/google-login",
            "/api/auth/forgot-password",
            "/api/auth/reset-password",
            "/connect/authorize",
            "/connect/token"
        };

        return publicPaths.Any(p => path.StartsWithSegments(p, StringComparison.OrdinalIgnoreCase));
    }

    private static bool RequiresTenantContext(PathString path)
    {
        // Endpoints that require tenant context
        var tenantRequiredPaths = new[]
        {
            "/api/users",
            "/api/applications",
            "/api/audit",
            "/api/org-units"
        };

        return tenantRequiredPaths.Any(p => path.StartsWithSegments(p, StringComparison.OrdinalIgnoreCase));
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
}
