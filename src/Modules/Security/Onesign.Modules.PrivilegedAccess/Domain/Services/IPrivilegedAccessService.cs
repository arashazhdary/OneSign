using Onesign.Modules.PrivilegedAccess.Domain.Entities;

namespace Onesign.Modules.PrivilegedAccess.Domain.Services;

public interface IPrivilegedAccessService
{
    Task<JitGrant> RequestJitAccessAsync(
        Guid tenantId,
        Guid userId,
        Guid roleId,
        int durationMinutes,
        string justification,
        CancellationToken cancellationToken = default);

    Task<bool> ApproveJitRequestAsync(
        Guid grantId,
        Guid approverId,
        CancellationToken cancellationToken = default);

    Task<bool> RevokeJitGrantAsync(
        Guid grantId,
        string? reason,
        CancellationToken cancellationToken = default);

    Task ExpireOutdatedGrantsAsync(CancellationToken cancellationToken = default);

    Task<bool> ValidatePrivilegedAccessAsync(
        Guid tenantId,
        Guid userId,
        Guid roleId,
        CancellationToken cancellationToken = default);

    Task<PrivilegedSession> StartPrivilegedSessionAsync(
        Guid tenantId,
        Guid userId,
        Guid grantId,
        string sessionType,
        CancellationToken cancellationToken = default);

    Task<bool> EndPrivilegedSessionAsync(
        Guid sessionId,
        CancellationToken cancellationToken = default);
}
