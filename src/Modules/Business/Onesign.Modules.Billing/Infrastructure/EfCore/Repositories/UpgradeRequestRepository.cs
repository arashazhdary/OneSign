using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Billing.Domain.Entities;
using Onesign.Modules.Billing.Domain.Enums;
using Onesign.Modules.Billing.Domain.Repositories;
using Onesign.Modules.Billing.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Billing.Infrastructure.EfCore.Repositories;

public class UpgradeRequestRepository : IUpgradeRequestRepository
{
    private readonly DbContext _dbContext;

    public UpgradeRequestRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<UpgradeRequest?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<UpgradeRequestEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity?.ToDomain();
    }

    public async Task<List<UpgradeRequest>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<UpgradeRequestEntity>()
            .Where(x => x.TenantId == tenantId)
            .OrderByDescending(x => x.RequestedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(e => e.ToDomain()).ToList();
    }

    public async Task<List<UpgradeRequest>> GetByStatusAsync(UpgradeRequestStatus status, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<UpgradeRequestEntity>()
            .Where(x => x.Status == status)
            .OrderByDescending(x => x.RequestedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(e => e.ToDomain()).ToList();
    }

    public async Task<UpgradeRequest> AddAsync(UpgradeRequest upgradeRequest, CancellationToken cancellationToken = default)
    {
        var entity = UpgradeRequestEntity.FromDomain(upgradeRequest);
        await _dbContext.Set<UpgradeRequestEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity.ToDomain();
    }

    public async Task UpdateAsync(UpgradeRequest upgradeRequest, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<UpgradeRequestEntity>()
            .FirstOrDefaultAsync(x => x.Id == upgradeRequest.Id, cancellationToken);

        if (entity == null)
            throw new InvalidOperationException($"UpgradeRequest with ID {upgradeRequest.Id} not found");

        entity.Status = upgradeRequest.Status;
        entity.ReviewedBy = upgradeRequest.ReviewedBy;
        entity.ReviewedAt = upgradeRequest.ReviewedAt;
        entity.ReviewComments = upgradeRequest.ReviewComments;

        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
