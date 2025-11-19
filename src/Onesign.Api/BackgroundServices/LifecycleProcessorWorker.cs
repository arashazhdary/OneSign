using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Onesign.Data.Contexts;

namespace Onesign.Api.BackgroundServices;

/// <summary>
/// Background worker that processes pending lifecycle events (Joiner/Mover/Leaver)
/// and triggers appropriate provisioning/deprovisioning actions.
/// </summary>
public class LifecycleProcessorWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<LifecycleProcessorWorker> _logger;
    private readonly IConfiguration _configuration;

    private const int BatchSize = 50;

    public LifecycleProcessorWorker(
        IServiceProvider serviceProvider,
        ILogger<LifecycleProcessorWorker> logger,
        IConfiguration configuration)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _configuration = configuration;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var intervalMinutes = _configuration.GetValue("BackgroundServices:LifecycleProcessor:IntervalMinutes", 5);
        var checkInterval = TimeSpan.FromMinutes(intervalMinutes);

        _logger.LogInformation("LifecycleProcessorWorker starting with interval of {Interval} minutes", intervalMinutes);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessPendingLifecycleEventsAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in LifecycleProcessorWorker execution");
            }

            await Task.Delay(checkInterval, stoppingToken);
        }
    }

    private async Task ProcessPendingLifecycleEventsAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<OnesignDbContext>();

        // Status: 0 = Pending
        var pendingEvents = await dbContext.LifecycleEvents
            .Where(e => e.Status == 0)
            .OrderBy(e => e.CreatedAt)
            .Take(BatchSize)
            .ToListAsync(cancellationToken);

        if (!pendingEvents.Any())
        {
            return;
        }

        _logger.LogInformation("Processing {Count} pending lifecycle events", pendingEvents.Count);

        foreach (var lifecycleEvent in pendingEvents)
        {
            try
            {
                await ProcessLifecycleEventAsync(lifecycleEvent, dbContext, cancellationToken);

                lifecycleEvent.Status = 1; // Processed
                lifecycleEvent.ProcessedAt = DateTime.UtcNow;
                lifecycleEvent.ErrorMessage = null;

                _logger.LogInformation("Lifecycle event {Id} of type {Type} processed successfully",
                    lifecycleEvent.Id, GetEventTypeName(lifecycleEvent.EventType));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing lifecycle event {Id}", lifecycleEvent.Id);
                lifecycleEvent.Status = 2; // Failed
                lifecycleEvent.ErrorMessage = ex.Message;
                lifecycleEvent.ProcessedAt = DateTime.UtcNow;
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Lifecycle processing batch completed at {Time}", DateTime.UtcNow);
    }

    private async Task ProcessLifecycleEventAsync(
        Onesign.Modules.IdentityLifecycle.Infrastructure.EfCore.Entities.LifecycleEventEntity lifecycleEvent,
        OnesignDbContext dbContext,
        CancellationToken cancellationToken)
    {
        // EventType: 0 = Joiner, 1 = Mover, 2 = Leaver
        switch (lifecycleEvent.EventType)
        {
            case 0: // Joiner
                await ProcessJoinerEventAsync(lifecycleEvent, dbContext, cancellationToken);
                break;
            case 1: // Mover
                await ProcessMoverEventAsync(lifecycleEvent, dbContext, cancellationToken);
                break;
            case 2: // Leaver
                await ProcessLeaverEventAsync(lifecycleEvent, dbContext, cancellationToken);
                break;
            default:
                throw new NotSupportedException($"Lifecycle event type {lifecycleEvent.EventType} is not supported");
        }
    }

    private async Task ProcessJoinerEventAsync(
        Onesign.Modules.IdentityLifecycle.Infrastructure.EfCore.Entities.LifecycleEventEntity lifecycleEvent,
        OnesignDbContext dbContext,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Processing Joiner event {Id} for tenant {TenantId}",
            lifecycleEvent.Id, lifecycleEvent.TenantId);

        // Find applicable access packages for the new employee
        var accessPackages = await dbContext.AccessPackages
            .Where(ap => ap.TenantId == lifecycleEvent.TenantId && ap.IsAutoAssigned)
            .ToListAsync(cancellationToken);

        // Get HR record details from NewSnapshotJson
        var hrRecord = await dbContext.HRIdentityRecords
            .FirstOrDefaultAsync(hr => hr.Id == lifecycleEvent.HRRecordId, cancellationToken);

        if (hrRecord != null)
        {
            // Create user account if it doesn't exist
            var existingUser = await dbContext.TenantUsers
                .FirstOrDefaultAsync(u => u.TenantId == lifecycleEvent.TenantId &&
                                         u.Email == hrRecord.WorkEmail, cancellationToken);

            if (existingUser == null)
            {
                _logger.LogInformation("Creating new tenant user for HR record {HRRecordId}", hrRecord.Id);
                // User creation would be handled by a dedicated service
            }

            // Queue notification for new user welcome
            await QueueNotificationAsync(dbContext, lifecycleEvent.TenantId,
                "user.onboarded", hrRecord.WorkEmail, cancellationToken);
        }

        _logger.LogDebug("Joiner event {Id} completed with {PackageCount} access packages",
            lifecycleEvent.Id, accessPackages.Count);
    }

    private async Task ProcessMoverEventAsync(
        Onesign.Modules.IdentityLifecycle.Infrastructure.EfCore.Entities.LifecycleEventEntity lifecycleEvent,
        OnesignDbContext dbContext,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Processing Mover event {Id} for tenant {TenantId}",
            lifecycleEvent.Id, lifecycleEvent.TenantId);

        // Compare old and new snapshots to determine what changed
        // Typical changes: department, manager, location, job title

        var hrRecord = await dbContext.HRIdentityRecords
            .FirstOrDefaultAsync(hr => hr.Id == lifecycleEvent.HRRecordId, cancellationToken);

        if (hrRecord != null)
        {
            // Update user's org unit assignments based on new department
            // Recalculate access based on new role/department

            // Queue notification for role change
            await QueueNotificationAsync(dbContext, lifecycleEvent.TenantId,
                "user.rolechanged", hrRecord.WorkEmail, cancellationToken);
        }

        _logger.LogDebug("Mover event {Id} processed", lifecycleEvent.Id);
    }

    private async Task ProcessLeaverEventAsync(
        Onesign.Modules.IdentityLifecycle.Infrastructure.EfCore.Entities.LifecycleEventEntity lifecycleEvent,
        OnesignDbContext dbContext,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Processing Leaver event {Id} for tenant {TenantId}",
            lifecycleEvent.Id, lifecycleEvent.TenantId);

        var hrRecord = await dbContext.HRIdentityRecords
            .FirstOrDefaultAsync(hr => hr.Id == lifecycleEvent.HRRecordId, cancellationToken);

        if (hrRecord != null)
        {
            // Find and disable user account
            var user = await dbContext.TenantUsers
                .FirstOrDefaultAsync(u => u.TenantId == lifecycleEvent.TenantId &&
                                         u.Email == hrRecord.WorkEmail, cancellationToken);

            if (user != null)
            {
                user.IsActive = false;
                user.UpdatedAt = DateTime.UtcNow;

                // Revoke all active sessions
                var sessions = await dbContext.UserLoginSessions
                    .Where(s => s.UserId == user.Id && s.RevokedAt == null)
                    .ToListAsync(cancellationToken);

                foreach (var session in sessions)
                {
                    session.RevokedAt = DateTime.UtcNow;
                }

                // Revoke all JIT grants
                var jitGrants = await dbContext.JitGrants
                    .Where(g => g.TenantId == lifecycleEvent.TenantId &&
                               g.UserId == user.Id &&
                               g.Status == 0) // Active
                    .ToListAsync(cancellationToken);

                foreach (var grant in jitGrants)
                {
                    grant.Status = 2; // Revoked
                }

                _logger.LogInformation("User {UserId} disabled and {SessionCount} sessions revoked for leaver event",
                    user.Id, sessions.Count);
            }
        }

        _logger.LogDebug("Leaver event {Id} processed", lifecycleEvent.Id);
    }

    private async Task QueueNotificationAsync(
        OnesignDbContext dbContext,
        Guid tenantId,
        string eventType,
        string recipientEmail,
        CancellationToken cancellationToken)
    {
        var notification = new Onesign.Modules.NotificationCenter.Infrastructure.EfCore.Entities.NotificationOutboxItemEntity
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Channel = 0, // Email
            Priority = 1, // Normal
            RecipientAddress = recipientEmail,
            Subject = $"Lifecycle Event: {eventType}",
            Body = $"A lifecycle event of type '{eventType}' has been processed.",
            EventType = eventType,
            Status = 0, // Pending
            AttemptCount = 0,
            CreatedAt = DateTime.UtcNow
        };

        dbContext.NotificationOutboxItems.Add(notification);
        await Task.CompletedTask;
    }

    private static string GetEventTypeName(int eventType) => eventType switch
    {
        0 => "Joiner",
        1 => "Mover",
        2 => "Leaver",
        _ => $"Unknown({eventType})"
    };
}
