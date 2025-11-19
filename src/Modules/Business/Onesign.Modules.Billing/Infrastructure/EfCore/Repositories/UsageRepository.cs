using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Billing.Domain.Entities;
using Onesign.Modules.Billing.Domain.Enums;
using Onesign.Modules.Billing.Domain.Repositories;
using Onesign.Modules.Billing.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Billing.Infrastructure.EfCore.Repositories;

public class UsageRepository : IUsageRepository
{
    private readonly DbContext _dbContext;

    public UsageRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<UsageCounter?> GetCounterAsync(Guid tenantId, UsageMetricType metricType, int year, int month, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<UsageCounterEntity>()
            .FirstOrDefaultAsync(x => x.TenantId == tenantId &&
                                     x.MetricType == metricType &&
                                     x.PeriodYear == year &&
                                     x.PeriodMonth == month, cancellationToken);

        return entity?.ToDomain();
    }

    public async Task<List<UsageCounter>> GetCountersForTenantAsync(Guid tenantId, int? year = null, int? month = null, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Set<UsageCounterEntity>()
            .Where(x => x.TenantId == tenantId);

        if (year.HasValue)
        {
            query = query.Where(x => x.PeriodYear == year.Value);
        }

        if (month.HasValue)
        {
            query = query.Where(x => x.PeriodMonth == month.Value);
        }

        var entities = await query.ToListAsync(cancellationToken);
        return entities.Select(e => e.ToDomain()).ToList();
    }

    public async Task<UsageCounter> UpsertCounterAsync(UsageCounter counter, CancellationToken cancellationToken = default)
    {
        var existing = await _dbContext.Set<UsageCounterEntity>()
            .FirstOrDefaultAsync(x => x.TenantId == counter.TenantId &&
                                     x.MetricType == counter.MetricType &&
                                     x.PeriodYear == counter.PeriodYear &&
                                     x.PeriodMonth == counter.PeriodMonth, cancellationToken);

        if (existing != null)
        {
            existing.Value = counter.Value;
            existing.UpdatedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync(cancellationToken);
            return existing.ToDomain();
        }
        else
        {
            var entity = UsageCounterEntity.FromDomain(counter);
            await _dbContext.Set<UsageCounterEntity>().AddAsync(entity, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);
            return entity.ToDomain();
        }
    }

    public async Task<TenantUsageSnapshot?> GetLatestSnapshotAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<TenantUsageSnapshotEntity>()
            .Where(x => x.TenantId == tenantId)
            .OrderByDescending(x => x.CapturedAt)
            .FirstOrDefaultAsync(cancellationToken);

        return entity?.ToDomain();
    }

    public async Task<List<TenantUsageSnapshot>> GetSnapshotsAsync(Guid tenantId, DateTime? from = null, DateTime? to = null, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Set<TenantUsageSnapshotEntity>()
            .Where(x => x.TenantId == tenantId);

        if (from.HasValue)
        {
            query = query.Where(x => x.CapturedAt >= from.Value);
        }

        if (to.HasValue)
        {
            query = query.Where(x => x.CapturedAt <= to.Value);
        }

        var entities = await query
            .OrderByDescending(x => x.CapturedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(e => e.ToDomain()).ToList();
    }

    public async Task<TenantUsageSnapshot> AddSnapshotAsync(TenantUsageSnapshot snapshot, CancellationToken cancellationToken = default)
    {
        var entity = TenantUsageSnapshotEntity.FromDomain(snapshot);
        await _dbContext.Set<TenantUsageSnapshotEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity.ToDomain();
    }
}
