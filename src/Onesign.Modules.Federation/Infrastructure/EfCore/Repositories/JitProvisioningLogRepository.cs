using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Federation.Domain.Entities;
using Onesign.Modules.Federation.Domain.Repositories;
using Onesign.Modules.Federation.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Federation.Infrastructure.EfCore.Repositories;

public class JitProvisioningLogRepository : IJitProvisioningLogRepository
{
    private readonly DbContext _dbContext;

    public JitProvisioningLogRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<JitProvisioningLog?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<JitProvisioningLogEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        return entity?.ToDomain();
    }

    public async Task<List<JitProvisioningLog>> GetByTenantIdAsync(Guid tenantId, int skip, int take, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<JitProvisioningLogEntity>()
            .Where(x => x.TenantId == tenantId)
            .OrderByDescending(x => x.CreatedAt)
            .Skip(skip)
            .Take(take)
            .ToListAsync(cancellationToken);
        return entities.Select(e => e.ToDomain()).ToList();
    }

    public async Task<List<JitProvisioningLog>> GetByUserIdAsync(Guid tenantId, string userId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<JitProvisioningLogEntity>()
            .Where(x => x.TenantId == tenantId && x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);
        return entities.Select(e => e.ToDomain()).ToList();
    }

    public async Task<JitProvisioningLog> AddAsync(JitProvisioningLog log, CancellationToken cancellationToken = default)
    {
        var entity = JitProvisioningLogEntity.FromDomain(log);
        await _dbContext.Set<JitProvisioningLogEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity.ToDomain();
    }
}
