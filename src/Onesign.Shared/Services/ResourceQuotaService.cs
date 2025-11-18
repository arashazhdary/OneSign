using System.Collections.Concurrent;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Onesign.Shared.Services;

/// <summary>
/// In-memory implementation of IResourceQuotaService
/// In production, this should be backed by a database or Redis
/// </summary>
public class ResourceQuotaService : IResourceQuotaService
{
    private readonly ILogger<ResourceQuotaService> _logger;
    private readonly IConfiguration _configuration;
    private readonly ConcurrentDictionary<string, ResourceUsage> _usageStore = new();

    // Default quotas per resource type (can be overridden by tenant plan)
    private readonly Dictionary<ResourceType, long> _defaultQuotas = new()
    {
        { ResourceType.Users, 100 },
        { ResourceType.Applications, 10 },
        { ResourceType.ApiCalls, 10000 },
        { ResourceType.Storage, 1073741824 }, // 1 GB in bytes
        { ResourceType.Sessions, 1000 },
        { ResourceType.AuditEvents, 100000 }
    };

    public ResourceQuotaService(ILogger<ResourceQuotaService> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
    }

    public Task<bool> CheckQuotaAsync(Guid tenantId, ResourceType resourceType, CancellationToken cancellationToken = default)
    {
        var key = GetKey(tenantId, resourceType);

        if (!_usageStore.TryGetValue(key, out var usage))
        {
            // No usage recorded yet, quota is available
            return Task.FromResult(true);
        }

        var hasQuota = usage.CurrentUsage < usage.MaxAllowed;

        if (!hasQuota)
        {
            _logger.LogWarning("Tenant {TenantId} has exceeded quota for {ResourceType}. Current: {Current}, Max: {Max}",
                tenantId, resourceType, usage.CurrentUsage, usage.MaxAllowed);
        }

        return Task.FromResult(hasQuota);
    }

    public Task<ResourceUsage> GetUsageAsync(Guid tenantId, ResourceType resourceType, CancellationToken cancellationToken = default)
    {
        var key = GetKey(tenantId, resourceType);

        if (_usageStore.TryGetValue(key, out var usage))
        {
            return Task.FromResult(usage);
        }

        // Return default usage with configured quota
        var maxAllowed = GetMaxAllowedForTenant(tenantId, resourceType);
        var defaultUsage = new ResourceUsage
        {
            TenantId = tenantId,
            ResourceType = resourceType,
            CurrentUsage = 0,
            MaxAllowed = maxAllowed,
            LastUpdated = DateTime.UtcNow
        };

        return Task.FromResult(defaultUsage);
    }

    public Task IncrementUsageAsync(Guid tenantId, ResourceType resourceType, long amount = 1, CancellationToken cancellationToken = default)
    {
        var key = GetKey(tenantId, resourceType);
        var maxAllowed = GetMaxAllowedForTenant(tenantId, resourceType);

        _usageStore.AddOrUpdate(key,
            _ => new ResourceUsage
            {
                TenantId = tenantId,
                ResourceType = resourceType,
                CurrentUsage = amount,
                MaxAllowed = maxAllowed,
                LastUpdated = DateTime.UtcNow
            },
            (_, existing) =>
            {
                existing.CurrentUsage += amount;
                existing.LastUpdated = DateTime.UtcNow;
                return existing;
            });

        _logger.LogDebug("Incremented {ResourceType} usage for tenant {TenantId} by {Amount}",
            resourceType, tenantId, amount);

        return Task.CompletedTask;
    }

    public Task DecrementUsageAsync(Guid tenantId, ResourceType resourceType, long amount = 1, CancellationToken cancellationToken = default)
    {
        var key = GetKey(tenantId, resourceType);

        if (_usageStore.TryGetValue(key, out var usage))
        {
            usage.CurrentUsage = Math.Max(0, usage.CurrentUsage - amount);
            usage.LastUpdated = DateTime.UtcNow;

            _logger.LogDebug("Decremented {ResourceType} usage for tenant {TenantId} by {Amount}",
                resourceType, tenantId, amount);
        }

        return Task.CompletedTask;
    }

    public Task<Dictionary<ResourceType, ResourceUsage>> GetAllUsageAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var result = new Dictionary<ResourceType, ResourceUsage>();

        foreach (ResourceType resourceType in Enum.GetValues<ResourceType>())
        {
            var key = GetKey(tenantId, resourceType);

            if (_usageStore.TryGetValue(key, out var usage))
            {
                result[resourceType] = usage;
            }
            else
            {
                var maxAllowed = GetMaxAllowedForTenant(tenantId, resourceType);
                result[resourceType] = new ResourceUsage
                {
                    TenantId = tenantId,
                    ResourceType = resourceType,
                    CurrentUsage = 0,
                    MaxAllowed = maxAllowed,
                    LastUpdated = DateTime.UtcNow
                };
            }
        }

        return Task.FromResult(result);
    }

    private static string GetKey(Guid tenantId, ResourceType resourceType)
    {
        return $"{tenantId}:{resourceType}";
    }

    private long GetMaxAllowedForTenant(Guid tenantId, ResourceType resourceType)
    {
        // Check for tenant-specific quota in configuration
        var configKey = $"Quotas:{tenantId}:{resourceType}";
        var configuredQuota = _configuration.GetValue<long?>(configKey);

        if (configuredQuota.HasValue)
        {
            return configuredQuota.Value;
        }

        // Check for default quota override in configuration
        var defaultConfigKey = $"Quotas:Default:{resourceType}";
        var defaultConfiguredQuota = _configuration.GetValue<long?>(defaultConfigKey);

        if (defaultConfiguredQuota.HasValue)
        {
            return defaultConfiguredQuota.Value;
        }

        // Return hardcoded default
        return _defaultQuotas.GetValueOrDefault(resourceType, 1000);
    }
}
