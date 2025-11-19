using Onesign.Modules.Security.Domain.Entities;

namespace Onesign.Modules.Security.Domain.Repositories;

public interface ISecurityPolicyRepository
{
    Task<SecurityPolicy?> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task AddAsync(SecurityPolicy securityPolicy, CancellationToken cancellationToken = default);
    Task UpdateAsync(SecurityPolicy securityPolicy, CancellationToken cancellationToken = default);
}
