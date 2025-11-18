namespace Onesign.Shared.Services;

/// <summary>
/// Resource types that can be tracked for quota management
/// </summary>
public enum ResourceType
{
    Users = 1,
    Applications = 2,
    ApiCalls = 3,
    Storage = 4,
    Sessions = 5,
    AuditEvents = 6
}

/// <summary>
/// Represents current usage statistics for a resource
/// </summary>
public class ResourceUsage
{
    public Guid TenantId { get; set; }
    public ResourceType ResourceType { get; set; }
    public long CurrentUsage { get; set; }
    public long MaxAllowed { get; set; }
    public double UsagePercentage => MaxAllowed > 0 ? (double)CurrentUsage / MaxAllowed * 100 : 0;
    public bool IsNearLimit => UsagePercentage >= 80;
    public bool IsAtLimit => CurrentUsage >= MaxAllowed;
    public DateTime LastUpdated { get; set; }
}

/// <summary>
/// Service for managing tenant resource quotas
/// </summary>
public interface IResourceQuotaService
{
    /// <summary>
    /// Checks if the tenant has available quota for the specified resource type
    /// </summary>
    /// <param name="tenantId">The tenant ID</param>
    /// <param name="resourceType">The type of resource</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if quota is available, false otherwise</returns>
    Task<bool> CheckQuotaAsync(Guid tenantId, ResourceType resourceType, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the current usage for a specific resource type
    /// </summary>
    /// <param name="tenantId">The tenant ID</param>
    /// <param name="resourceType">The type of resource</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Resource usage details</returns>
    Task<ResourceUsage> GetUsageAsync(Guid tenantId, ResourceType resourceType, CancellationToken cancellationToken = default);

    /// <summary>
    /// Increments the usage counter for a resource type
    /// </summary>
    /// <param name="tenantId">The tenant ID</param>
    /// <param name="resourceType">The type of resource</param>
    /// <param name="amount">Amount to increment (default 1)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task IncrementUsageAsync(Guid tenantId, ResourceType resourceType, long amount = 1, CancellationToken cancellationToken = default);

    /// <summary>
    /// Decrements the usage counter for a resource type
    /// </summary>
    /// <param name="tenantId">The tenant ID</param>
    /// <param name="resourceType">The type of resource</param>
    /// <param name="amount">Amount to decrement (default 1)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task DecrementUsageAsync(Guid tenantId, ResourceType resourceType, long amount = 1, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all resource usage for a tenant
    /// </summary>
    /// <param name="tenantId">The tenant ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Dictionary of resource types and their usage</returns>
    Task<Dictionary<ResourceType, ResourceUsage>> GetAllUsageAsync(Guid tenantId, CancellationToken cancellationToken = default);
}
