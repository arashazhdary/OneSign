using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Audit.Infrastructure.EfCore.Entities;
using Onesign.Modules.Identity.Infrastructure.EfCore.Entities;
using Onesign.Modules.NotificationCenter.Infrastructure.EfCore.Entities;
using Onesign.Modules.Extensibility.Infrastructure.EfCore.Entities;
using Onesign.Modules.Privacy.Domain.Entities;
using Onesign.Modules.Privacy.Domain.Enums;
using Onesign.Modules.Privacy.Domain.Repositories;
using Onesign.Modules.Privacy.Domain.Services;

namespace Onesign.Modules.Privacy.Infrastructure.Services;

/// <summary>
/// Service for managing and executing data retention policies.
/// </summary>
public class DataRetentionService : IDataRetentionService
{
    private readonly IDataRetentionPolicyRepository _policyRepository;
    private readonly IServiceProvider _serviceProvider;
    private readonly IAnonymizationService _anonymizationService;
    private readonly ILogger<DataRetentionService> _logger;

    public DataRetentionService(
        IDataRetentionPolicyRepository policyRepository,
        IServiceProvider serviceProvider,
        IAnonymizationService anonymizationService,
        ILogger<DataRetentionService> logger)
    {
        _policyRepository = policyRepository;
        _serviceProvider = serviceProvider;
        _anonymizationService = anonymizationService;
        _logger = logger;
    }

    public async Task<IEnumerable<DataRetentionPolicy>> GetPoliciesAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        return await _policyRepository.GetByTenantIdAsync(tenantId, cancellationToken);
    }

    public async Task ExecuteCleanupAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var policies = await _policyRepository.GetEnabledPoliciesAsync(tenantId, cancellationToken);

        _logger.LogInformation("Executing retention cleanup for tenant {TenantId}. {PolicyCount} policies to apply",
            tenantId, policies.Count());

        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<DbContext>();

        foreach (var policy in policies)
        {
            try
            {
                var cutoffDate = DateTime.UtcNow.AddDays(-policy.RetentionPeriodDays);
                var deletedCount = await ExecutePolicyCleanupAsync(dbContext, policy, cutoffDate, cancellationToken);

                if (deletedCount > 0)
                {
                    await LogRetentionActionAsync(dbContext, tenantId, policy, deletedCount, cancellationToken);
                    _logger.LogInformation(
                        "Retention policy {PolicyId} applied for tenant {TenantId}: {DeletedCount} records cleaned (category: {Category})",
                        policy.Id, tenantId, deletedCount, policy.Category);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing retention policy {PolicyId} for tenant {TenantId}",
                    policy.Id, tenantId);
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task<int> ExecutePolicyCleanupAsync(
        DbContext dbContext,
        DataRetentionPolicy policy,
        DateTime cutoffDate,
        CancellationToken cancellationToken)
    {
        return policy.Category switch
        {
            DataCategory.AuditLogs => await CleanupAuditLogsAsync(dbContext, policy, cutoffDate, cancellationToken),
            // DataCategory.LoginHistory and DataCategory.Sessions not available in enum
            // DataCategory.Notifications not available in enum
            // DataCategory.WebhookLogs not available in enum
            _ => 0
        };
    }

    private async Task<int> CleanupAuditLogsAsync(
        DbContext dbContext,
        DataRetentionPolicy policy,
        DateTime cutoffDate,
        CancellationToken cancellationToken)
    {
        var oldEvents = await dbContext.Set<AuditEventEntity>()
            .Where(a => a.TenantId == policy.TenantId && a.CreatedAt < cutoffDate)
            .ToListAsync(cancellationToken);

        if (!oldEvents.Any()) return 0;

        if (policy.HardDeleteAfter)
        {
            dbContext.Set<AuditEventEntity>().RemoveRange(oldEvents);
        }
        else
        {
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
        DbContext dbContext,
        DataRetentionPolicy policy,
        DateTime cutoffDate,
        CancellationToken cancellationToken)
    {
        var loginEvents = await dbContext.Set<AuditEventEntity>()
            .Where(a => a.TenantId == policy.TenantId &&
                       a.CreatedAt < cutoffDate &&
                       (a.EventType == Onesign.Modules.Audit.Domain.Enums.AuditEventType.UserLoggedIn ||
                        a.EventType == Onesign.Modules.Audit.Domain.Enums.AuditEventType.LoginFailed))
            .ToListAsync(cancellationToken);

        if (loginEvents.Any())
        {
            dbContext.Set<AuditEventEntity>().RemoveRange(loginEvents);
        }

        return loginEvents.Count;
    }

    private async Task<int> CleanupSessionsAsync(
        DbContext dbContext,
        DataRetentionPolicy policy,
        DateTime cutoffDate,
        CancellationToken cancellationToken)
    {
        var userIds = await dbContext.Set<TenantUserEntity>()
            .Where(u => u.TenantId == policy.TenantId)
            .Select(u => u.Id)
            .ToListAsync(cancellationToken);

        var oldSessions = await dbContext.Set<UserLoginSessionEntity>()
            .Where(s => userIds.Contains(s.TenantUserId) &&
                       s.CreatedAt < cutoffDate &&
                       (s.ExpiresAt < DateTime.UtcNow || s.RevokedAt != null))
            .ToListAsync(cancellationToken);

        if (oldSessions.Any())
        {
            dbContext.Set<UserLoginSessionEntity>().RemoveRange(oldSessions);
        }

        return oldSessions.Count;
    }

    private async Task<int> CleanupNotificationsAsync(
        DbContext dbContext,
        DataRetentionPolicy policy,
        DateTime cutoffDate,
        CancellationToken cancellationToken)
    {
        var oldNotifications = await dbContext.Set<NotificationOutboxItemEntity>()
            .Where(n => n.TenantId == policy.TenantId &&
                       n.CreatedAt < cutoffDate &&
                       (n.Status == 1 || n.Status == 2))
            .ToListAsync(cancellationToken);

        if (oldNotifications.Any())
        {
            dbContext.Set<NotificationOutboxItemEntity>().RemoveRange(oldNotifications);
        }

        return oldNotifications.Count;
    }

    private async Task<int> CleanupWebhookLogsAsync(
        DbContext dbContext,
        DataRetentionPolicy policy,
        DateTime cutoffDate,
        CancellationToken cancellationToken)
    {
        var oldLogs = await dbContext.Set<WebhookDeliveryLogEntity>()
            .Where(w => w.TenantId == policy.TenantId &&
                       w.CreatedAt < cutoffDate &&
                       (w.Status == 2 || w.Status == 3))
            .ToListAsync(cancellationToken);

        if (oldLogs.Any())
        {
            dbContext.Set<WebhookDeliveryLogEntity>().RemoveRange(oldLogs);
        }

        return oldLogs.Count;
    }

    private static async Task LogRetentionActionAsync(
        DbContext dbContext,
        Guid tenantId,
        DataRetentionPolicy policy,
        int deletedCount,
        CancellationToken cancellationToken)
    {
        var auditEvent = new Onesign.Modules.Audit.Infrastructure.EfCore.Entities.AuditEventEntity
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            EventType = Onesign.Modules.Audit.Domain.Enums.AuditEventType.DataDeleted,
            Description = $"Data retention policy executed: {deletedCount} records processed",
            Metadata = System.Text.Json.JsonSerializer.Serialize(new
            {
                PolicyId = policy.Id,
                Category = policy.Category.ToString(),
                RetentionDays = policy.RetentionPeriodDays,
                RecordsProcessed = deletedCount,
                HardDelete = policy.HardDeleteAfter
            }),
            CreatedAt = DateTime.UtcNow
        };

        dbContext.Set<AuditEventEntity>().Add(auditEvent);
        await Task.CompletedTask;
    }
}
