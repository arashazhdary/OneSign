using Microsoft.EntityFrameworkCore;
using Onesign.Data.Contexts;
using Onesign.Modules.Privacy.Domain.Services;

namespace Onesign.Api.BackgroundServices;

/// <summary>
/// Background worker that enforces data retention policies across all tenants,
/// deleting or anonymizing data based on configured retention periods.
/// </summary>
public class DataRetentionEnforcementWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DataRetentionEnforcementWorker> _logger;
    private readonly IConfiguration _configuration;

    public DataRetentionEnforcementWorker(
        IServiceProvider serviceProvider,
        ILogger<DataRetentionEnforcementWorker> logger,
        IConfiguration configuration)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _configuration = configuration;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var intervalHours = _configuration.GetValue("BackgroundServices:DataRetention:IntervalHours", 6);
        var checkInterval = TimeSpan.FromHours(intervalHours);
        var batchSize = _configuration.GetValue("BackgroundServices:DataRetention:BatchSize", 100);

        _logger.LogInformation("DataRetentionEnforcementWorker starting with interval of {Interval} hours", intervalHours);

        await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessRetentionPoliciesAsync(batchSize, stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DataRetentionEnforcementWorker execution");
            }

            await Task.Delay(checkInterval, stoppingToken);
        }
    }

    private async Task ProcessRetentionPoliciesAsync(int batchSize, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Starting data retention enforcement run");

        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<OnesignDbContext>();

        var tenantIds = await dbContext.Tenants
            .Where(t => t.Status == Onesign.Modules.Tenants.Domain.Enums.TenantStatus.Active)
            .Select(t => t.Id)
            .ToListAsync(cancellationToken);

        _logger.LogInformation("Processing retention policies for {TenantCount} active tenants", tenantIds.Count);

        var totalCleaned = 0;
        var tenantsProcessed = 0;
        var errors = 0;

        foreach (var tenantId in tenantIds)
        {
            try
            {
                var cleaned = await ProcessTenantRetentionAsync(tenantId, batchSize, cancellationToken);
                totalCleaned += cleaned;
                tenantsProcessed++;

                if (cleaned > 0)
                {
                    _logger.LogInformation("Cleaned {RecordCount} records for tenant {TenantId}", cleaned, tenantId);
                }
            }
            catch (Exception ex)
            {
                errors++;
                _logger.LogError(ex, "Error processing retention for tenant {TenantId}", tenantId);
            }
        }

        _logger.LogInformation(
            "Data retention enforcement completed. Tenants: {TenantsProcessed}, Records cleaned: {TotalCleaned}, Errors: {Errors}",
            tenantsProcessed, totalCleaned, errors);
    }

    private async Task<int> ProcessTenantRetentionAsync(
        Guid tenantId,
        int batchSize,
        CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var retentionService = scope.ServiceProvider.GetRequiredService<IDataRetentionService>();
        var dbContext = scope.ServiceProvider.GetRequiredService<OnesignDbContext>();

        var policies = await dbContext.DataRetentionPolicies
            .Where(p => p.TenantId == tenantId && p.Enabled)
            .ToListAsync(cancellationToken);

        if (!policies.Any())
        {
            return 0;
        }

        var totalCleaned = 0;

        foreach (var policy in policies)
        {
            var cutoffDate = DateTime.UtcNow.AddDays(-policy.RetentionPeriodDays);
            var cleaned = await ApplyPolicyAsync(dbContext, policy, cutoffDate, batchSize, cancellationToken);
            totalCleaned += cleaned;

            if (cleaned > 0)
            {
                await LogRetentionEventAsync(dbContext, tenantId, policy.DataCategory, cleaned, cancellationToken);
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        return totalCleaned;
    }

    private async Task<int> ApplyPolicyAsync(
        OnesignDbContext dbContext,
        Onesign.Modules.Privacy.Infrastructure.EfCore.Entities.DataRetentionPolicyEntity policy,
        DateTime cutoffDate,
        int batchSize,
        CancellationToken cancellationToken)
    {
        return policy.DataCategory switch
        {
            0 => await CleanupAuditLogsAsync(dbContext, policy, cutoffDate, batchSize, cancellationToken),
            1 => await CleanupLoginHistoryAsync(dbContext, policy, cutoffDate, batchSize, cancellationToken),
            2 => await CleanupSessionsAsync(dbContext, policy, cutoffDate, batchSize, cancellationToken),
            3 => await CleanupNotificationsAsync(dbContext, policy, cutoffDate, batchSize, cancellationToken),
            4 => await CleanupWebhookLogsAsync(dbContext, policy, cutoffDate, batchSize, cancellationToken),
            _ => 0
        };
    }

    private async Task<int> CleanupAuditLogsAsync(
        OnesignDbContext dbContext,
        Onesign.Modules.Privacy.Infrastructure.EfCore.Entities.DataRetentionPolicyEntity policy,
        DateTime cutoffDate,
        int batchSize,
        CancellationToken cancellationToken)
    {
        var oldEvents = await dbContext.AuditEvents
            .Where(a => a.TenantId == policy.TenantId && a.CreatedAt < cutoffDate)
            .Take(batchSize)
            .ToListAsync(cancellationToken);

        if (!oldEvents.Any()) return 0;

        if (policy.HardDeleteAfter)
        {
            dbContext.AuditEvents.RemoveRange(oldEvents);
        }
        else
        {
            foreach (var evt in oldEvents)
            {
                evt.ActorId = null;
                evt.IpAddress = "ANONYMIZED";
                evt.UserAgent = "ANONYMIZED";
                evt.Metadata = null;
            }
        }

        return oldEvents.Count;
    }

    private async Task<int> CleanupLoginHistoryAsync(
        OnesignDbContext dbContext,
        Onesign.Modules.Privacy.Infrastructure.EfCore.Entities.DataRetentionPolicyEntity policy,
        DateTime cutoffDate,
        int batchSize,
        CancellationToken cancellationToken)
    {
        var loginEvents = await dbContext.AuditEvents
            .Where(a => a.TenantId == policy.TenantId &&
                       a.CreatedAt < cutoffDate &&
                       (a.EventType == Onesign.Modules.Audit.Domain.Enums.AuditEventType.UserLoggedIn ||
                        a.EventType == Onesign.Modules.Audit.Domain.Enums.AuditEventType.LoginFailed))
            .Take(batchSize)
            .ToListAsync(cancellationToken);

        if (loginEvents.Any())
        {
            dbContext.AuditEvents.RemoveRange(loginEvents);
        }

        return loginEvents.Count;
    }

    private async Task<int> CleanupSessionsAsync(
        OnesignDbContext dbContext,
        Onesign.Modules.Privacy.Infrastructure.EfCore.Entities.DataRetentionPolicyEntity policy,
        DateTime cutoffDate,
        int batchSize,
        CancellationToken cancellationToken)
    {
        var userIds = await dbContext.TenantUsers
            .Where(u => u.TenantId == policy.TenantId)
            .Select(u => u.Id)
            .ToListAsync(cancellationToken);

        var oldSessions = await dbContext.UserLoginSessions
            .Where(s => userIds.Contains(s.UserId) &&
                       s.CreatedAt < cutoffDate &&
                       (s.ExpiresAt < DateTime.UtcNow || s.RevokedAt != null))
            .Take(batchSize)
            .ToListAsync(cancellationToken);

        if (oldSessions.Any())
        {
            dbContext.UserLoginSessions.RemoveRange(oldSessions);
        }

        return oldSessions.Count;
    }

    private async Task<int> CleanupNotificationsAsync(
        OnesignDbContext dbContext,
        Onesign.Modules.Privacy.Infrastructure.EfCore.Entities.DataRetentionPolicyEntity policy,
        DateTime cutoffDate,
        int batchSize,
        CancellationToken cancellationToken)
    {
        var oldNotifications = await dbContext.NotificationOutboxItems
            .Where(n => n.TenantId == policy.TenantId &&
                       n.CreatedAt < cutoffDate &&
                       (n.Status == 1 || n.Status == 2))
            .Take(batchSize)
            .ToListAsync(cancellationToken);

        if (oldNotifications.Any())
        {
            dbContext.NotificationOutboxItems.RemoveRange(oldNotifications);
        }

        return oldNotifications.Count;
    }

    private async Task<int> CleanupWebhookLogsAsync(
        OnesignDbContext dbContext,
        Onesign.Modules.Privacy.Infrastructure.EfCore.Entities.DataRetentionPolicyEntity policy,
        DateTime cutoffDate,
        int batchSize,
        CancellationToken cancellationToken)
    {
        var oldLogs = await dbContext.WebhookDeliveryLogs
            .Where(w => w.TenantId == policy.TenantId &&
                       w.CreatedAt < cutoffDate &&
                       (w.Status == 2 || w.Status == 3))
            .Take(batchSize)
            .ToListAsync(cancellationToken);

        if (oldLogs.Any())
        {
            dbContext.WebhookDeliveryLogs.RemoveRange(oldLogs);
        }

        return oldLogs.Count;
    }

    private static async Task LogRetentionEventAsync(
        OnesignDbContext dbContext,
        Guid tenantId,
        int dataCategory,
        int recordCount,
        CancellationToken cancellationToken)
    {
        var categoryName = dataCategory switch
        {
            0 => "AuditLogs",
            1 => "LoginHistory",
            2 => "Sessions",
            3 => "Notifications",
            4 => "WebhookLogs",
            _ => "Unknown"
        };

        var auditEvent = new Onesign.Modules.Audit.Infrastructure.EfCore.Entities.AuditEventEntity
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            EventType = Onesign.Modules.Audit.Domain.Enums.AuditEventType.DataDeleted,
            Description = $"Retention enforcement: {recordCount} {categoryName} records cleaned",
            Metadata = System.Text.Json.JsonSerializer.Serialize(new
            {
                Category = categoryName,
                RecordsProcessed = recordCount
            }),
            CreatedAt = DateTime.UtcNow
        };

        dbContext.AuditEvents.Add(auditEvent);
        await Task.CompletedTask;
    }
}
