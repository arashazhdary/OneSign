using Onesign.Modules.PrivilegedAccess.Domain.Entities;

namespace Onesign.Modules.PrivilegedAccess.Domain.Services;

public interface IJitGrantService
{
    Task<JitGrant> CreateJitGrantAsync(Guid tenantId, Guid userId, Guid roleId, int durationMinutes, Guid approvedBy, string justification, CancellationToken cancellationToken = default);
    Task ExpireJitGrantAsync(Guid jitGrantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<JitGrant>> GetActiveGrantsForUserAsync(Guid tenantId, Guid userId, CancellationToken cancellationToken = default);
}
