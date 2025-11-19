using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Security.Domain.Entities;
using Onesign.Modules.Security.Domain.Repositories;
using Onesign.Modules.Security.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Security.Infrastructure.EfCore.Repositories;

public class OrgUnitMfaRuleRepository : IOrgUnitMfaRuleRepository
{
    private readonly DbContext _dbContext;

    public OrgUnitMfaRuleRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<OrgUnitMfaRule>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<OrgUnitMfaRuleEntity>()
            .Where(x => x.TenantId == tenantId)
            .ToListAsync(cancellationToken);

        return entities.Select(e => e.ToDomain()).ToList();
    }

    public async Task<OrgUnitMfaRule?> GetByOrgUnitIdAsync(Guid orgUnitId, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<OrgUnitMfaRuleEntity>()
            .FirstOrDefaultAsync(x => x.OrgUnitId == orgUnitId, cancellationToken);

        return entity?.ToDomain();
    }

    public async Task AddAsync(OrgUnitMfaRule rule, CancellationToken cancellationToken = default)
    {
        var entity = OrgUnitMfaRuleEntity.FromDomain(rule);
        await _dbContext.Set<OrgUnitMfaRuleEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task AddRangeAsync(List<OrgUnitMfaRule> rules, CancellationToken cancellationToken = default)
    {
        var entities = rules.Select(OrgUnitMfaRuleEntity.FromDomain).ToList();
        await _dbContext.Set<OrgUnitMfaRuleEntity>().AddRangeAsync(entities, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(OrgUnitMfaRule rule, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<OrgUnitMfaRuleEntity>()
            .FirstOrDefaultAsync(x => x.Id == rule.Id, cancellationToken);

        if (entity != null)
        {
            entity.TenantId = rule.TenantId;
            entity.OrgUnitId = rule.OrgUnitId;
            entity.MfaRequired = rule.MfaRequired;
            entity.UpdatedAt = rule.UpdatedAt;

            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task DeleteByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<OrgUnitMfaRuleEntity>()
            .Where(x => x.TenantId == tenantId)
            .ToListAsync(cancellationToken);

        _dbContext.Set<OrgUnitMfaRuleEntity>().RemoveRange(entities);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
