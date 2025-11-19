using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Insights.Domain.Entities;
using Onesign.Modules.Insights.Domain.Repositories;
using Onesign.Modules.Insights.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Insights.Infrastructure.EfCore.Repositories;

public class TenantDailyUsageSnapshotRepository : ITenantDailyUsageSnapshotRepository
{
    private readonly DbContext _dbContext;

    public TenantDailyUsageSnapshotRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<TenantDailyUsageSnapshot?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<TenantDailyUsageSnapshotEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, ct);
        return entity == null ? null : MapToDomain(entity);
    }

    public async Task<TenantDailyUsageSnapshot?> GetByTenantAndDateAsync(Guid tenantId, DateOnly date, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<TenantDailyUsageSnapshotEntity>()
            .FirstOrDefaultAsync(x => x.TenantId == tenantId && x.Date == date, ct);
        return entity == null ? null : MapToDomain(entity);
    }

    public async Task<IReadOnlyList<TenantDailyUsageSnapshot>> GetByTenantAndDateRangeAsync(Guid tenantId, DateOnly from, DateOnly to, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<TenantDailyUsageSnapshotEntity>()
            .Where(x => x.TenantId == tenantId && x.Date >= from && x.Date <= to)
            .OrderBy(x => x.Date)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<TenantDailyUsageSnapshot>> GetAllByDateAsync(DateOnly date, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<TenantDailyUsageSnapshotEntity>()
            .Where(x => x.Date == date)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<TenantDailyUsageSnapshot>> GetLatestByTenantsAsync(int days, CancellationToken ct = default)
    {
        var cutoffDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-days));
        var entities = await _dbContext.Set<TenantDailyUsageSnapshotEntity>()
            .Where(x => x.Date >= cutoffDate)
            .OrderByDescending(x => x.Date)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<TenantDailyUsageSnapshot?> GetLatestAsync(Guid tenantId, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<TenantDailyUsageSnapshotEntity>()
            .Where(x => x.TenantId == tenantId)
            .OrderByDescending(x => x.Date)
            .FirstOrDefaultAsync(ct);
        return entity == null ? null : MapToDomain(entity);
    }

    public async Task AddAsync(TenantDailyUsageSnapshot snapshot, CancellationToken ct = default)
    {
        var entity = MapToEntity(snapshot);
        await _dbContext.Set<TenantDailyUsageSnapshotEntity>().AddAsync(entity, ct);
        await _dbContext.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(TenantDailyUsageSnapshot snapshot, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<TenantDailyUsageSnapshotEntity>()
            .FirstOrDefaultAsync(x => x.Id == snapshot.Id, ct);
        if (entity != null)
        {
            entity.TotalUsers = snapshot.TotalUsers;
            entity.ActiveUsers = snapshot.ActiveUsers;
            entity.MfaEnabledUsers = snapshot.MfaEnabledUsers;
            entity.TotalApplications = snapshot.TotalApplications;
            entity.ApplicationsWithSSOEnabled = snapshot.ApplicationsWithSSOEnabled;
            entity.TotalSignInCount = snapshot.TotalSignInCount;
            entity.FailedSignInCount = snapshot.FailedSignInCount;
            entity.HighRiskSignInCount = snapshot.HighRiskSignInCount;
            entity.AccessRequestCount = snapshot.AccessRequestCount;
            entity.AccessRequestApprovedCount = snapshot.AccessRequestApprovedCount;
            entity.LifecycleEventsCount = snapshot.LifecycleEventsCount;
            entity.EmergencyAccessCount = snapshot.EmergencyAccessCount;
            entity.ActiveIncidents = snapshot.ActiveIncidents;
            entity.PendingChangeSets = snapshot.PendingChangeSets;
            entity.RiskyApplications = snapshot.RiskyApplications;
            entity.SecurityScore = snapshot.SecurityScore;
            await _dbContext.SaveChangesAsync(ct);
        }
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<TenantDailyUsageSnapshotEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity != null)
        {
            _dbContext.Set<TenantDailyUsageSnapshotEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(ct);
        }
    }

    public async Task DeleteOlderThanAsync(DateOnly date, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<TenantDailyUsageSnapshotEntity>()
            .Where(x => x.Date < date)
            .ToListAsync(ct);
        _dbContext.Set<TenantDailyUsageSnapshotEntity>().RemoveRange(entities);
        await _dbContext.SaveChangesAsync(ct);
    }

    private static TenantDailyUsageSnapshot MapToDomain(TenantDailyUsageSnapshotEntity entity) => new()
    {
        Id = entity.Id,
        TenantId = entity.TenantId,
        Date = entity.Date,
        TotalUsers = entity.TotalUsers,
        ActiveUsers = entity.ActiveUsers,
        MfaEnabledUsers = entity.MfaEnabledUsers,
        TotalApplications = entity.TotalApplications,
        ApplicationsWithSSOEnabled = entity.ApplicationsWithSSOEnabled,
        TotalSignInCount = entity.TotalSignInCount,
        FailedSignInCount = entity.FailedSignInCount,
        HighRiskSignInCount = entity.HighRiskSignInCount,
        AccessRequestCount = entity.AccessRequestCount,
        AccessRequestApprovedCount = entity.AccessRequestApprovedCount,
        LifecycleEventsCount = entity.LifecycleEventsCount,
        EmergencyAccessCount = entity.EmergencyAccessCount,
        ActiveIncidents = entity.ActiveIncidents,
        PendingChangeSets = entity.PendingChangeSets,
        RiskyApplications = entity.RiskyApplications,
        SecurityScore = entity.SecurityScore,
        CreatedAt = entity.CreatedAt
    };

    private static TenantDailyUsageSnapshotEntity MapToEntity(TenantDailyUsageSnapshot snapshot) => new()
    {
        Id = snapshot.Id,
        TenantId = snapshot.TenantId,
        Date = snapshot.Date,
        TotalUsers = snapshot.TotalUsers,
        ActiveUsers = snapshot.ActiveUsers,
        MfaEnabledUsers = snapshot.MfaEnabledUsers,
        TotalApplications = snapshot.TotalApplications,
        ApplicationsWithSSOEnabled = snapshot.ApplicationsWithSSOEnabled,
        TotalSignInCount = snapshot.TotalSignInCount,
        FailedSignInCount = snapshot.FailedSignInCount,
        HighRiskSignInCount = snapshot.HighRiskSignInCount,
        AccessRequestCount = snapshot.AccessRequestCount,
        AccessRequestApprovedCount = snapshot.AccessRequestApprovedCount,
        LifecycleEventsCount = snapshot.LifecycleEventsCount,
        EmergencyAccessCount = snapshot.EmergencyAccessCount,
        ActiveIncidents = snapshot.ActiveIncidents,
        PendingChangeSets = snapshot.PendingChangeSets,
        RiskyApplications = snapshot.RiskyApplications,
        SecurityScore = snapshot.SecurityScore,
        CreatedAt = snapshot.CreatedAt
    };
}
