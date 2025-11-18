using Microsoft.Extensions.Logging;
using Onesign.Modules.PrivilegedAccess.Domain.Entities;
using Onesign.Modules.PrivilegedAccess.Domain.Enums;
using Onesign.Modules.PrivilegedAccess.Domain.Repositories;
using Onesign.Modules.PrivilegedAccess.Domain.Services;

namespace Onesign.Modules.PrivilegedAccess.Infrastructure.Services;

public class PrivilegedAccessService : IPrivilegedAccessService
{
    private readonly IJitGrantRepository _grantRepository;
    private readonly IPrivilegedSessionRepository _sessionRepository;
    private readonly ILogger<PrivilegedAccessService> _logger;

    public PrivilegedAccessService(
        IJitGrantRepository grantRepository,
        IPrivilegedSessionRepository sessionRepository,
        ILogger<PrivilegedAccessService> logger)
    {
        _grantRepository = grantRepository;
        _sessionRepository = sessionRepository;
        _logger = logger;
    }

    public async Task<JitGrant> RequestJitAccessAsync(
        Guid tenantId,
        Guid userId,
        Guid roleId,
        int durationMinutes,
        string justification,
        CancellationToken cancellationToken = default)
    {
        var grant = new JitGrant
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            UserId = userId,
            RoleId = roleId,
            RoleName = $"Role-{roleId}", // In real implementation, fetch from role service
            GrantedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddMinutes(durationMinutes),
            ApprovedBy = userId, // Self-approved for demonstration
            Status = JitGrantStatus.Active,
            Justification = justification
        };

        await _grantRepository.AddAsync(grant, cancellationToken);

        _logger.LogInformation(
            "JIT access granted: {GrantId} for user {UserId} to role {RoleId}, expires at {ExpiresAt}",
            grant.Id, userId, roleId, grant.ExpiresAt);

        return grant;
    }

    public async Task<bool> ApproveJitRequestAsync(
        Guid grantId,
        Guid approverId,
        CancellationToken cancellationToken = default)
    {
        var grant = await _grantRepository.GetByIdAsync(grantId, cancellationToken);
        if (grant == null || grant.Status != JitGrantStatus.Pending)
            return false;

        grant.Status = JitGrantStatus.Active;
        grant.ApprovedBy = approverId;
        grant.GrantedAt = DateTime.UtcNow;
        grant.ExpiresAt = DateTime.UtcNow.AddMinutes(60); // Default duration

        await _grantRepository.UpdateAsync(grant, cancellationToken);

        _logger.LogInformation("JIT grant {GrantId} approved by {ApproverId}", grantId, approverId);
        return true;
    }

    public async Task<bool> RevokeJitGrantAsync(
        Guid grantId,
        string? reason,
        CancellationToken cancellationToken = default)
    {
        var grant = await _grantRepository.GetByIdAsync(grantId, cancellationToken);
        if (grant == null)
            return false;

        grant.Status = JitGrantStatus.Revoked;
        await _grantRepository.UpdateAsync(grant, cancellationToken);

        _logger.LogInformation("JIT grant {GrantId} revoked. Reason: {Reason}",
            grantId, reason ?? "No reason provided");
        return true;
    }

    public async Task ExpireOutdatedGrantsAsync(CancellationToken cancellationToken = default)
    {
        var expiredGrants = await _grantRepository.GetExpiredGrantsAsync(cancellationToken);

        foreach (var grant in expiredGrants)
        {
            grant.Status = JitGrantStatus.Expired;
            await _grantRepository.UpdateAsync(grant, cancellationToken);

            _logger.LogInformation("JIT grant {GrantId} expired", grant.Id);
        }

        if (expiredGrants.Any())
        {
            _logger.LogInformation("Expired {Count} JIT grants", expiredGrants.Count);
        }
    }

    public async Task<bool> ValidatePrivilegedAccessAsync(
        Guid tenantId,
        Guid userId,
        Guid roleId,
        CancellationToken cancellationToken = default)
    {
        var grants = await _grantRepository.GetActiveGrantsForUserAsync(tenantId, userId, cancellationToken);
        return grants.Any(g => g.RoleId == roleId && g.Status == JitGrantStatus.Active && g.ExpiresAt > DateTime.UtcNow);
    }

    public async Task<PrivilegedSession> StartPrivilegedSessionAsync(
        Guid tenantId,
        Guid userId,
        Guid grantId,
        string sessionType,
        CancellationToken cancellationToken = default)
    {
        // Get the grant to retrieve role information
        var grant = await _grantRepository.GetByIdAsync(grantId, cancellationToken);
        var roleName = grant?.RoleName ?? sessionType;

        var session = new PrivilegedSession
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            UserId = userId,
            UserDisplayName = $"User-{userId}",
            PrivilegedRolesJson = System.Text.Json.JsonSerializer.Serialize(new[] { roleName }),
            StartedAt = DateTime.UtcNow,
            LastActivityAt = DateTime.UtcNow,
            IsActive = true
        };

        await _sessionRepository.AddAsync(session, cancellationToken);

        _logger.LogInformation(
            "Privileged session started: {SessionId} for user {UserId}, role {Role}",
            session.Id, userId, roleName);

        return session;
    }

    public async Task<bool> EndPrivilegedSessionAsync(
        Guid sessionId,
        CancellationToken cancellationToken = default)
    {
        var session = await _sessionRepository.GetByIdAsync(sessionId, cancellationToken);
        if (session == null)
            return false;

        session.EndedAt = DateTime.UtcNow;
        session.IsActive = false;
        await _sessionRepository.UpdateAsync(session, cancellationToken);

        _logger.LogInformation(
            "Privileged session ended: {SessionId}, duration {Duration} minutes",
            sessionId, (session.EndedAt.Value - session.StartedAt).TotalMinutes);

        return true;
    }
}
