using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Billing.Domain.Entities;
using Onesign.Modules.Billing.Domain.Enums;
using Onesign.Modules.Billing.Domain.Repositories;
using Onesign.Modules.Billing.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Billing.Infrastructure.EfCore.Repositories;

public class SubscriptionRepository : ISubscriptionRepository
{
    private readonly DbContext _dbContext;

    public SubscriptionRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<TenantSubscription?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<TenantSubscriptionEntity>()
            .Include(s => s.Plan)
                .ThenInclude(p => p!.Features)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity?.ToDomain();
    }

    public async Task<TenantSubscription?> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<TenantSubscriptionEntity>()
            .Include(s => s.Plan)
                .ThenInclude(p => p!.Features)
            .FirstOrDefaultAsync(x => x.TenantId == tenantId, cancellationToken);

        return entity?.ToDomain();
    }

    public async Task<List<TenantSubscription>> GetByPlanIdAsync(Guid planId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<TenantSubscriptionEntity>()
            .Include(s => s.Plan)
                .ThenInclude(p => p!.Features)
            .Where(x => x.PlanId == planId)
            .ToListAsync(cancellationToken);

        return entities.Select(e => e.ToDomain()).ToList();
    }

    public async Task<List<TenantSubscription>> GetByStatusAsync(SubscriptionStatus status, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<TenantSubscriptionEntity>()
            .Include(s => s.Plan)
                .ThenInclude(p => p!.Features)
            .Where(x => x.Status == status)
            .ToListAsync(cancellationToken);

        return entities.Select(e => e.ToDomain()).ToList();
    }

    public async Task<TenantSubscription> AddAsync(TenantSubscription subscription, CancellationToken cancellationToken = default)
    {
        var entity = TenantSubscriptionEntity.FromDomain(subscription);
        await _dbContext.Set<TenantSubscriptionEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity.ToDomain();
    }

    public async Task UpdateAsync(TenantSubscription subscription, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<TenantSubscriptionEntity>()
            .FirstOrDefaultAsync(x => x.Id == subscription.Id, cancellationToken);

        if (entity == null)
            throw new InvalidOperationException($"Subscription with ID {subscription.Id} not found");

        entity.PlanId = subscription.PlanId;
        entity.Status = subscription.Status;
        entity.StartedAt = subscription.StartedAt;
        entity.TrialEndsAt = subscription.TrialEndsAt;
        entity.CurrentPeriodEndsAt = subscription.CurrentPeriodEndsAt;
        entity.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<TenantSubscriptionEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity != null)
        {
            _dbContext.Set<TenantSubscriptionEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}
