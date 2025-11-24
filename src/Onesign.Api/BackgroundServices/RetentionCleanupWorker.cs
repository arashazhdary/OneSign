using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Onesign.Data.Contexts;

namespace Onesign.Api.BackgroundServices;

/// <summary>
/// Background worker that applies data retention policies per tenant,
/// deleting or anonymizing old data based on configured retention periods.
/// </summary>
public class RetentionCleanupWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<RetentionCleanupWorker> _logger;
    private readonly IConfiguration _configuration;

    public RetentionCleanupWorker(
        IServiceProvider serviceProvider,
        ILogger<RetentionCleanupWorker> logger,
        IConfiguration configuration)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _configuration = configuration;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var intervalHours = _configuration.GetValue("BackgroundServices:RetentionCleanup:IntervalHours", 24);
        var checkInterval = TimeSpan.FromHours(intervalHours);

        _logger.LogInformation("RetentionCleanupWorker starting with interval of {Interval} hours", intervalHours);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ApplyRetentionPoliciesAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in RetentionCleanupWorker execution");
            }

            await Task.Delay(checkInterval, stoppingToken);
        }
    }

    private async Task ApplyRetentionPoliciesAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<OnesignDbContext>();

        var policies = await dbContext.DataRetentionPolicies
            .Where(p => p.Enabled)
            .ToListAsync(cancellationToken);

        if (!policies.Any())
        {
            _logger.LogDebug("No active retention policies found");
            return;
        }

        _logger.LogInformation("Applying {Count} data retention policies", policies.Count);

        foreach (var policy in policies)
        {
            try
            {
                var deletedCount = await ApplyRetentionPolicyAsync(dbContext, policy, cancellationToken);

                // Log the cleanup action
                if (deletedCount > 0)
                {
                    var auditEvent = new Onesign.Modules.Audit.Infrastructure.EfCore.Entities.AuditEventEntity
                    {
                        Id = Guid.NewGuid(),
                        TenantId = policy.TenantId,
                        EventType = Onesign.Modules.Audit.Domain.Enums.AuditEventType.DataDeleted,
                        Description = $"Retention policy applied: {deletedCount} records cleaned for category {GetDataCategoryName(policy.DataCategory)}",
                        Metadata = System.Text.Json.JsonSerializer.Serialize(new
                        {
                            PolicyId = policy.Id,
                            DataCategory = policy.DataCategory,
                            RetentionDays = policy.RetentionPeriodDays,
                            DeletedCount = deletedCount,
                            HardDelete = policy.HardDeleteAfter
                        }),
                        CreatedAt = DateTime.UtcNow
                    };

                    dbContext.AuditEvents.Add(auditEvent);

                    _logger.LogInformation(
                        "Retention policy {PolicyId} applied: {DeletedCount} records cleaned for tenant {TenantId}",
                        policy.Id, deletedCount, policy.TenantId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error applying retention policy {PolicyId}", policy.Id);
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Retention cleanup completed at {Time}", DateTime.UtcNow);
    }

    private async Task<int> ApplyRetentionPolicyAsync(
        OnesignDbContext dbContext,
        Onesign.Modules.Privacy.Infrastructure.EfCore.Entities.DataRetentionPolicyEntity policy,
        CancellationToken cancellationToken)
    {
        var cutoffDate = DateTime.UtcNow.AddDays(-policy.RetentionPeriodDays);
        var deletedCount = 0;

        // DataCategory: 0 = AuditLogs, 1 = LoginHistory, 2 = Sessions, 3 = Notifications, 4 = Webhooks
        switch (policy.DataCategory)
        {
            case 0: // Audit Logs
                deletedCount = await CleanupAuditLogsAsync(dbContext, policy.TenantId, cutoffDate, policy.HardDeleteAfter, cancellationToken);
                break;

            case 1: // Login History
                deletedCount = await CleanupLoginHistoryAsync(dbContext, policy.TenantId, cutoffDate, cancellationToken);
                break;

            case 2: // Sessions
                deletedCount = await CleanupSessionsAsync(dbContext, policy.TenantId, cutoffDate, cancellationToken);
                break;

            case 3: // Notifications
                deletedCount = await CleanupNotificationsAsync(dbContext, policy.TenantId, cutoffDate, cancellationToken);
                break;

            case 4: // Webhook Logs
                deletedCount = await CleanupWebhookLogsAsync(dbContext, policy.TenantId, cutoffDate, cancellationToken);
                break;

            default:
                _logger.LogWarning("Unknown data category {Category} in retention policy {PolicyId}",
                    policy.DataCategory, policy.Id);
                break;
        }

        return deletedCount;
    }

    private async Task<int> CleanupAuditLogsAsync(
        OnesignDbContext dbContext,
        Guid tenantId,
        DateTime cutoffDate,
        bool hardDelete,
        CancellationToken cancellationToken)
    {
        var oldEvents = await dbContext.AuditEvents
            .Where(a => a.TenantId == tenantId && a.CreatedAt < cutoffDate)
            .ToListAsync(cancellationToken);

        if (!oldEvents.Any())
        {
            return 0;
        }

        if (hardDelete)
        {
            dbContext.AuditEvents.RemoveRange(oldEvents);
        }
        else
        {
            // Anonymize instead of delete
            foreach (var auditEvent in oldEvents)
            {
                auditEvent.ActorId = null;
                auditEvent.IpAddress = "ANONYMIZED";
                auditEvent.UserAgent = "ANONYMIZED";
                auditEvent.Metadata = null;
            }
        }

        return oldEvents.Count;
    }

    private async Task<int> CleanupLoginHistoryAsync(
        OnesignDbContext dbContext,
        Guid tenantId,
        DateTime cutoffDate,
        CancellationToken cancellationToken)
    {
        // Clean up old audit events related to logins
        var loginEvents = await dbContext.AuditEvents
            .Where(a => a.TenantId == tenantId &&
                       a.CreatedAt < cutoffDate &&
                       (a.EventType == Onesign.Modules.Audit.Domain.Enums.AuditEventType.UserLoggedIn ||
                        a.EventType == Onesign.Modules.Audit.Domain.Enums.AuditEventType.LoginFailed))
            .ToListAsync(cancellationToken);

        if (loginEvents.Any())
        {
            dbContext.AuditEvents.RemoveRange(loginEvents);
        }

        return loginEvents.Count;
    }

    private async Task<int> CleanupSessionsAsync(
        OnesignDbContext dbContext,
        Guid tenantId,
        DateTime cutoffDate,
        CancellationToken cancellationToken)
    {
        // Find users in this tenant first
        var userIds = await dbContext.TenantUsers
            .Where(u => u.TenantId == tenantId)
            .Select(u => u.Id)
            .ToListAsync(cancellationToken);

        var oldSessions = await dbContext.UserLoginSessions
            .Where(s => userIds.Contains(s.TenantUserId) &&
                       s.CreatedAt < cutoffDate &&
                       (s.ExpiresAt < DateTime.UtcNow || s.RevokedAt != null))
            .ToListAsync(cancellationToken);

        if (oldSessions.Any())
        {
            dbContext.UserLoginSessions.RemoveRange(oldSessions);
        }

        return oldSessions.Count;
    }

    private async Task<int> CleanupNotificationsAsync(
        OnesignDbContext dbContext,
        Guid tenantId,
        DateTime cutoffDate,
        CancellationToken cancellationToken)
    {
        // Only clean up sent/failed notifications
        var oldNotifications = await dbContext.NotificationOutboxItems
            .Where(n => n.TenantId == tenantId &&
                       n.CreatedAt < cutoffDate &&
                       (n.Status == 1 || n.Status == 2)) // Sent or Failed
            .ToListAsync(cancellationToken);

        if (oldNotifications.Any())
        {
            dbContext.NotificationOutboxItems.RemoveRange(oldNotifications);
        }

        // Also clean up old delivery logs
        var oldDeliveryLogs = await dbContext.NotificationDeliveryLogs
            .Where(l => l.TenantId == tenantId && l.Timestamp < cutoffDate)
            .ToListAsync(cancellationToken);

        if (oldDeliveryLogs.Any())
        {
            dbContext.NotificationDeliveryLogs.RemoveRange(oldDeliveryLogs);
        }

        return oldNotifications.Count + oldDeliveryLogs.Count;
    }

    private async Task<int> CleanupWebhookLogsAsync(
        OnesignDbContext dbContext,
        Guid tenantId,
        DateTime cutoffDate,
        CancellationToken cancellationToken)
    {
        // Only clean up delivered/failed webhook logs
        var oldLogs = await dbContext.WebhookDeliveryLogs
            .Where(w => w.TenantId == tenantId &&
                       w.CreatedAt < cutoffDate &&
                       (w.Status == 2 || w.Status == 3)) // Delivered or Failed
            .ToListAsync(cancellationToken);

        if (oldLogs.Any())
        {
            dbContext.WebhookDeliveryLogs.RemoveRange(oldLogs);
        }

        return oldLogs.Count;
    }

    private static string GetDataCategoryName(int category) => category switch
    {
        0 => "AuditLogs",
        1 => "LoginHistory",
        2 => "Sessions",
        3 => "Notifications",
        4 => "WebhookLogs",
        _ => $"Unknown({category})"
    };
}
