using Onesign.Modules.PrivilegedAccess.Domain.Entities;
using Onesign.Modules.PrivilegedAccess.Domain.Enums;
using Onesign.Modules.PrivilegedAccess.Domain.Repositories;
using Onesign.Modules.PrivilegedAccess.Domain.Services;

namespace Onesign.Modules.PrivilegedAccess.Infrastructure.Services;

public class JitGrantService : IJitGrantService
{
    private readonly IJitGrantRepository _grantRepository;

    public JitGrantService(IJitGrantRepository grantRepository)
    {
        _grantRepository = grantRepository;
    }

    public async Task<JitGrant> CreateJitGrantAsync(
        Guid tenantId,
        Guid userId,
        Guid roleId,
        int durationMinutes,
        Guid approvedBy,
        string justification,
        CancellationToken cancellationToken = default)
    {
        var grant = new JitGrant
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            UserId = userId,
            RoleId = roleId,
            RoleName = $"Role-{roleId}", // In a real system, fetch from role service
            GrantedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddMinutes(durationMinutes),
            ApprovedBy = approvedBy,
            Status = JitGrantStatus.Active,
            Justification = justification
        };

        await _grantRepository.AddAsync(grant, cancellationToken);
        return grant;
    }

    public async Task ExpireJitGrantAsync(Guid jitGrantId, CancellationToken cancellationToken = default)
    {
        var grant = await _grantRepository.GetByIdAsync(jitGrantId, cancellationToken);
        if (grant != null)
        {
            grant.Status = JitGrantStatus.Expired;
            await _grantRepository.UpdateAsync(grant, cancellationToken);
        }
    }

    public async Task<IReadOnlyList<JitGrant>> GetActiveGrantsForUserAsync(
        Guid tenantId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        return await _grantRepository.GetActiveGrantsForUserAsync(tenantId, userId, cancellationToken);
    }
}
