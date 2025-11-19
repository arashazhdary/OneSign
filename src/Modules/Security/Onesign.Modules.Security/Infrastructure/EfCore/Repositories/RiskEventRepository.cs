using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Security.Domain.Entities;
using Onesign.Modules.Security.Domain.Enums;
using Onesign.Modules.Security.Domain.Repositories;
using Onesign.Modules.Security.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Security.Infrastructure.EfCore.Repositories;

public class RiskEventRepository : IRiskEventRepository
{
    private readonly DbContext _dbContext;

    public RiskEventRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<RiskEvent?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<RiskEventEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity?.ToDomain();
    }

    public async Task<List<RiskEvent>> GetByTenantIdAsync(
        Guid tenantId,
        DateTime? fromDate,
        DateTime? toDate,
        RiskLevel? riskLevel,
        RiskEventType? eventType,
        Guid? tenantUserId,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Set<RiskEventEntity>()
            .Where(x => x.TenantId == tenantId);

        if (fromDate.HasValue)
        {
            query = query.Where(x => x.CreatedAt >= fromDate.Value);
        }

        if (toDate.HasValue)
        {
            query = query.Where(x => x.CreatedAt <= toDate.Value);
        }

        if (riskLevel.HasValue)
        {
            query = query.Where(x => x.RiskLevel == riskLevel.Value);
        }

        if (eventType.HasValue)
        {
            query = query.Where(x => x.EventType == eventType.Value);
        }

        if (tenantUserId.HasValue)
        {
            query = query.Where(x => x.TenantUserId == tenantUserId.Value);
        }

        var entities = await query
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(e => e.ToDomain()).ToList();
    }

    public async Task AddAsync(RiskEvent riskEvent, CancellationToken cancellationToken = default)
    {
        var entity = RiskEventEntity.FromDomain(riskEvent);
        await _dbContext.Set<RiskEventEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
