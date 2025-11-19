using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Insights.Domain.Entities;
using Onesign.Modules.Insights.Domain.Repositories;
using Onesign.Modules.Insights.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Insights.Infrastructure.EfCore.Repositories;

public class ApplicationDailyUsageSnapshotRepository : IApplicationDailyUsageSnapshotRepository
{
    private readonly DbContext _dbContext;

    public ApplicationDailyUsageSnapshotRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<ApplicationDailyUsageSnapshot?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<ApplicationDailyUsageSnapshotEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, ct);
        return entity == null ? null : MapToDomain(entity);
    }

    public async Task<ApplicationDailyUsageSnapshot?> GetByApplicationAndDateAsync(Guid tenantId, Guid applicationId, DateOnly date, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<ApplicationDailyUsageSnapshotEntity>()
            .FirstOrDefaultAsync(x => x.TenantId == tenantId && x.ApplicationId == applicationId && x.Date == date, ct);
        return entity == null ? null : MapToDomain(entity);
    }

    public async Task<IReadOnlyList<ApplicationDailyUsageSnapshot>> GetByTenantAndDateAsync(Guid tenantId, DateOnly date, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<ApplicationDailyUsageSnapshotEntity>()
            .Where(x => x.TenantId == tenantId && x.Date == date)
            .OrderByDescending(x => x.SignInCount)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<ApplicationDailyUsageSnapshot>> GetByApplicationAndDateRangeAsync(Guid tenantId, Guid applicationId, DateOnly from, DateOnly to, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<ApplicationDailyUsageSnapshotEntity>()
            .Where(x => x.TenantId == tenantId && x.ApplicationId == applicationId && x.Date >= from && x.Date <= to)
            .OrderBy(x => x.Date)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<ApplicationDailyUsageSnapshot>> GetTopApplicationsByUsageAsync(Guid tenantId, DateOnly date, int top, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<ApplicationDailyUsageSnapshotEntity>()
            .Where(x => x.TenantId == tenantId && x.Date == date)
            .OrderByDescending(x => x.SignInCount)
            .Take(top)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task AddAsync(ApplicationDailyUsageSnapshot snapshot, CancellationToken ct = default)
    {
        var entity = MapToEntity(snapshot);
        await _dbContext.Set<ApplicationDailyUsageSnapshotEntity>().AddAsync(entity, ct);
        await _dbContext.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(ApplicationDailyUsageSnapshot snapshot, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<ApplicationDailyUsageSnapshotEntity>()
            .FirstOrDefaultAsync(x => x.Id == snapshot.Id, ct);
        if (entity != null)
        {
            entity.UniqueUsers = snapshot.UniqueUsers;
            entity.SignInCount = snapshot.SignInCount;
            entity.FailedSignInCount = snapshot.FailedSignInCount;
            entity.HighRiskSignInCount = snapshot.HighRiskSignInCount;
            await _dbContext.SaveChangesAsync(ct);
        }
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<ApplicationDailyUsageSnapshotEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity != null)
        {
            _dbContext.Set<ApplicationDailyUsageSnapshotEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(ct);
        }
    }

    public async Task DeleteOlderThanAsync(DateOnly date, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<ApplicationDailyUsageSnapshotEntity>()
            .Where(x => x.Date < date)
            .ToListAsync(ct);
        _dbContext.Set<ApplicationDailyUsageSnapshotEntity>().RemoveRange(entities);
        await _dbContext.SaveChangesAsync(ct);
    }

    private static ApplicationDailyUsageSnapshot MapToDomain(ApplicationDailyUsageSnapshotEntity entity) => new()
    {
        Id = entity.Id,
        TenantId = entity.TenantId,
        ApplicationId = entity.ApplicationId,
        Date = entity.Date,
        UniqueUsers = entity.UniqueUsers,
        SignInCount = entity.SignInCount,
        FailedSignInCount = entity.FailedSignInCount,
        HighRiskSignInCount = entity.HighRiskSignInCount,
        CreatedAt = entity.CreatedAt
    };

    private static ApplicationDailyUsageSnapshotEntity MapToEntity(ApplicationDailyUsageSnapshot snapshot) => new()
    {
        Id = snapshot.Id,
        TenantId = snapshot.TenantId,
        ApplicationId = snapshot.ApplicationId,
        Date = snapshot.Date,
        UniqueUsers = snapshot.UniqueUsers,
        SignInCount = snapshot.SignInCount,
        FailedSignInCount = snapshot.FailedSignInCount,
        HighRiskSignInCount = snapshot.HighRiskSignInCount,
        CreatedAt = snapshot.CreatedAt
    };
}
