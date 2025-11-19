using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Security.Domain.Entities;
using Onesign.Modules.Security.Domain.Repositories;
using Onesign.Modules.Security.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Security.Infrastructure.EfCore.Repositories;

public class SecurityPolicyRepository : ISecurityPolicyRepository
{
    private readonly DbContext _dbContext;

    public SecurityPolicyRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<SecurityPolicy?> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<SecurityPolicyEntity>()
            .FirstOrDefaultAsync(x => x.TenantId == tenantId, cancellationToken);

        return entity?.ToDomain();
    }

    public async Task AddAsync(SecurityPolicy securityPolicy, CancellationToken cancellationToken = default)
    {
        var entity = SecurityPolicyEntity.FromDomain(securityPolicy);
        await _dbContext.Set<SecurityPolicyEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(SecurityPolicy securityPolicy, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<SecurityPolicyEntity>()
            .FirstOrDefaultAsync(x => x.TenantId == securityPolicy.TenantId, cancellationToken);

        if (entity != null)
        {
            entity.MfaRequirementLevel = securityPolicy.MfaRequirementLevel;
            entity.AllowMfaRememberDevice = securityPolicy.AllowMfaRememberDevice;
            entity.RememberDeviceDays = securityPolicy.RememberDeviceDays;
            entity.RequireMfaForSensitiveApps = securityPolicy.RequireMfaForSensitiveApps;
            entity.MaxFailedLoginAttempts = securityPolicy.MaxFailedLoginAttempts;
            entity.EnableGeoAnomalyDetection = securityPolicy.EnableGeoAnomalyDetection;
            entity.BlockLevel = securityPolicy.BlockLevel;
            entity.UpdatedAt = securityPolicy.UpdatedAt;

            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}
