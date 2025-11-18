using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Onesign.Api.Data;

namespace Onesign.Api.BackgroundServices;

/// <summary>
/// Background worker that monitors JIT (Just-In-Time) grants for expiration
/// and automatically revokes expired access.
/// </summary>
public class JitExpiryWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<JitExpiryWorker> _logger;
    private readonly IConfiguration _configuration;

    private const int BatchSize = 100;

    public JitExpiryWorker(
        IServiceProvider serviceProvider,
        ILogger<JitExpiryWorker> logger,
        IConfiguration configuration)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _configuration = configuration;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var intervalSeconds = _configuration.GetValue("BackgroundServices:JitExpiry:IntervalSeconds", 60);
        var checkInterval = TimeSpan.FromSeconds(intervalSeconds);

        _logger.LogInformation("JitExpiryWorker starting with interval of {Interval} seconds", intervalSeconds);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessExpiredJitGrantsAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in JitExpiryWorker execution");
            }

            await Task.Delay(checkInterval, stoppingToken);
        }
    }

    private async Task ProcessExpiredJitGrantsAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<OnesignDbContext>();

        var now = DateTime.UtcNow;

        // Status: 0 = Active
        var expiredGrants = await dbContext.JitGrants
            .Where(g => g.Status == 0 && g.ExpiresAt <= now)
            .Take(BatchSize)
            .ToListAsync(cancellationToken);

        if (!expiredGrants.Any())
        {
            return;
        }

        _logger.LogInformation("Processing {Count} expired JIT grants", expiredGrants.Count);

        var usersToNotify = new List<(Guid TenantId, Guid UserId, string RoleName)>();

        foreach (var grant in expiredGrants)
        {
            try
            {
                // Revoke the grant
                grant.Status = 1; // Expired

                _logger.LogInformation(
                    "JIT grant {GrantId} expired for user {UserId}, role {RoleName}",
                    grant.Id, grant.UserId, grant.RoleName);

                // Collect user info for notifications
                usersToNotify.Add((grant.TenantId, grant.UserId, grant.RoleName));

                // Terminate any associated privileged sessions
                var activeSessions = await dbContext.PrivilegedSessions
                    .Where(s => s.TenantId == grant.TenantId &&
                               s.UserId == grant.UserId &&
                               s.JitGrantId == grant.Id &&
                               s.Status == 0) // Active
                    .ToListAsync(cancellationToken);

                foreach (var session in activeSessions)
                {
                    session.Status = 2; // Terminated
                    session.EndedAt = now;
                    _logger.LogDebug("Terminated privileged session {SessionId} due to JIT grant expiry", session.Id);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error revoking JIT grant {GrantId}", grant.Id);
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        // Send notifications to users about expired grants
        foreach (var (tenantId, userId, roleName) in usersToNotify)
        {
            try
            {
                await SendExpiryNotificationAsync(dbContext, tenantId, userId, roleName, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending expiry notification to user {UserId}", userId);
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("JIT expiry processing completed at {Time}", DateTime.UtcNow);
    }

    private async Task SendExpiryNotificationAsync(
        OnesignDbContext dbContext,
        Guid tenantId,
        Guid userId,
        string roleName,
        CancellationToken cancellationToken)
    {
        // Get user email
        var user = await dbContext.TenantUsers
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        if (user == null)
        {
            _logger.LogWarning("User {UserId} not found for JIT expiry notification", userId);
            return;
        }

        var notification = new Onesign.Modules.NotificationCenter.Infrastructure.EfCore.Entities.NotificationOutboxItemEntity
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Channel = 0, // Email
            Priority = 1, // Normal
            RecipientAddress = user.Email,
            RecipientUserId = userId,
            Subject = $"Privileged Access Expired: {roleName}",
            Body = $"Your just-in-time access to the role '{roleName}' has expired. " +
                   $"If you still need this access, please submit a new access request.",
            EventType = "jit.expired",
            ContextDataJson = System.Text.Json.JsonSerializer.Serialize(new { RoleName = roleName }),
            Status = 0, // Pending
            AttemptCount = 0,
            CreatedAt = DateTime.UtcNow
        };

        dbContext.NotificationOutboxItems.Add(notification);

        _logger.LogDebug("Queued JIT expiry notification for user {UserId}", userId);
    }
}
