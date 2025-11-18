using Microsoft.AspNetCore.Http;
using Onesign.Shared.Tenant;

namespace Onesign.Shared.MultiTenancy;

/// <summary>
/// Implementation of ITenantContextAccessor that uses HttpContext to store tenant information
/// </summary>
public class TenantContextAccessor : ITenantContextAccessor
{
    private const string TenantContextKey = "TenantContext";
    private const string TenantIdKey = "TenantId";

    private readonly IHttpContextAccessor _httpContextAccessor;

    public TenantContextAccessor(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
    }

    public Guid? GetCurrentTenantId()
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null)
        {
            return null;
        }

        // First check for TenantContext
        if (httpContext.Items.TryGetValue(TenantContextKey, out var contextObj) && contextObj is TenantContext context)
        {
            return context.TenantId;
        }

        // Fall back to direct TenantId item
        if (httpContext.Items.TryGetValue(TenantIdKey, out var tenantIdObj))
        {
            if (tenantIdObj is Guid tenantId)
            {
                return tenantId;
            }

            if (tenantIdObj is string tenantIdString && Guid.TryParse(tenantIdString, out var parsedTenantId))
            {
                return parsedTenantId;
            }
        }

        // Check claims for tenant_id
        var tenantIdClaim = httpContext.User?.FindFirst("tenant_id")?.Value;
        if (!string.IsNullOrEmpty(tenantIdClaim) && Guid.TryParse(tenantIdClaim, out var claimTenantId))
        {
            return claimTenantId;
        }

        return null;
    }

    public TenantContext? GetCurrentTenant()
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null)
        {
            return null;
        }

        if (httpContext.Items.TryGetValue(TenantContextKey, out var contextObj) && contextObj is TenantContext context)
        {
            return context;
        }

        // Create a basic context from TenantId if available
        var tenantId = GetCurrentTenantId();
        if (tenantId.HasValue)
        {
            return new TenantContext
            {
                TenantId = tenantId
            };
        }

        return null;
    }

    public void SetCurrentTenant(TenantContext tenantContext)
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null)
        {
            throw new InvalidOperationException("No HttpContext available to set tenant context");
        }

        httpContext.Items[TenantContextKey] = tenantContext;
        if (tenantContext.TenantId.HasValue)
        {
            httpContext.Items[TenantIdKey] = tenantContext.TenantId.Value;
        }
    }
}
