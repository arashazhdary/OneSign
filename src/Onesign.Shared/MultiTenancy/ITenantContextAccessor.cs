using Onesign.Shared.Tenant;

namespace Onesign.Shared.MultiTenancy;

/// <summary>
/// Provides access to the current tenant context
/// </summary>
public interface ITenantContextAccessor
{
    /// <summary>
    /// Gets the current tenant ID from the HTTP context
    /// </summary>
    /// <returns>The tenant ID if available, null otherwise</returns>
    Guid? GetCurrentTenantId();

    /// <summary>
    /// Gets the current tenant context with full details
    /// </summary>
    /// <returns>The tenant context if available</returns>
    TenantContext? GetCurrentTenant();

    /// <summary>
    /// Sets the current tenant context
    /// </summary>
    /// <param name="tenantContext">The tenant context to set</param>
    void SetCurrentTenant(TenantContext tenantContext);
}
