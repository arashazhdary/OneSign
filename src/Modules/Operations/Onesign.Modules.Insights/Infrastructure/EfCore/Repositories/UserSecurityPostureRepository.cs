using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Insights.Domain.Entities;
using Onesign.Modules.Insights.Domain.Repositories;
using Onesign.Modules.Insights.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Insights.Infrastructure.EfCore.Repositories;

public class UserSecurityPostureRepository : IUserSecurityPostureRepository
{
    private readonly DbContext _dbContext;

    public UserSecurityPostureRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<UserSecurityPosture?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<UserSecurityPostureEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, ct);
        return entity == null ? null : MapToDomain(entity);
    }

    public async Task<UserSecurityPosture?> GetByUserIdAsync(Guid tenantId, Guid userId, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<UserSecurityPostureEntity>()
            .FirstOrDefaultAsync(x => x.TenantId == tenantId && x.UserId == userId, ct);
        return entity == null ? null : MapToDomain(entity);
    }

    public async Task<IReadOnlyList<UserSecurityPosture>> GetByTenantIdAsync(Guid tenantId, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<UserSecurityPostureEntity>()
            .Where(x => x.TenantId == tenantId)
            .OrderByDescending(x => x.HighRiskEventsLast30Days)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<UserSecurityPosture>> GetByTenantIdPagedAsync(Guid tenantId, int skip, int take, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<UserSecurityPostureEntity>()
            .Where(x => x.TenantId == tenantId)
            .OrderByDescending(x => x.HighRiskEventsLast30Days)
            .Skip(skip)
            .Take(take)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<UserSecurityPosture>> GetHighRiskUsersAsync(Guid tenantId, int minHighRiskEvents, int take, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<UserSecurityPostureEntity>()
            .Where(x => x.TenantId == tenantId && x.HighRiskEventsLast30Days >= minHighRiskEvents)
            .OrderByDescending(x => x.HighRiskEventsLast30Days)
            .Take(take)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<UserSecurityPosture>> GetUsersWithoutMfaAsync(Guid tenantId, int take, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<UserSecurityPostureEntity>()
            .Where(x => x.TenantId == tenantId && !x.MfaEnabled)
            .OrderByDescending(x => x.HighRiskEventsLast30Days)
            .Take(take)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<UserSecurityPosture>> GetInactiveUsersAsync(Guid tenantId, int daysInactive, int take, CancellationToken ct = default)
    {
        var cutoffDate = DateTime.UtcNow.AddDays(-daysInactive);
        var entities = await _dbContext.Set<UserSecurityPostureEntity>()
            .Where(x => x.TenantId == tenantId && (x.LastSignInAt == null || x.LastSignInAt < cutoffDate))
            .OrderBy(x => x.LastSignInAt)
            .Take(take)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<int> GetTotalCountAsync(Guid tenantId, CancellationToken ct = default)
    {
        return await _dbContext.Set<UserSecurityPostureEntity>()
            .CountAsync(x => x.TenantId == tenantId, ct);
    }

    public async Task AddAsync(UserSecurityPosture posture, CancellationToken ct = default)
    {
        var entity = MapToEntity(posture);
        await _dbContext.Set<UserSecurityPostureEntity>().AddAsync(entity, ct);
        await _dbContext.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(UserSecurityPosture posture, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<UserSecurityPostureEntity>()
            .FirstOrDefaultAsync(x => x.Id == posture.Id, ct);
        if (entity != null)
        {
            entity.LastSignInAt = posture.LastSignInAt;
            entity.MfaEnabled = posture.MfaEnabled;
            entity.EnabledAppsCount = posture.EnabledAppsCount;
            entity.UsedAppsLast30DaysCount = posture.UsedAppsLast30DaysCount;
            entity.HighRiskEventsLast30Days = posture.HighRiskEventsLast30Days;
            entity.IsAnonymized = posture.IsAnonymized;
            entity.UpdatedAt = posture.UpdatedAt;
            await _dbContext.SaveChangesAsync(ct);
        }
    }

    public async Task UpsertAsync(UserSecurityPosture posture, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<UserSecurityPostureEntity>()
            .FirstOrDefaultAsync(x => x.TenantId == posture.TenantId && x.UserId == posture.UserId, ct);

        if (entity == null)
        {
            entity = MapToEntity(posture);
            await _dbContext.Set<UserSecurityPostureEntity>().AddAsync(entity, ct);
        }
        else
        {
            entity.LastSignInAt = posture.LastSignInAt;
            entity.MfaEnabled = posture.MfaEnabled;
            entity.EnabledAppsCount = posture.EnabledAppsCount;
            entity.UsedAppsLast30DaysCount = posture.UsedAppsLast30DaysCount;
            entity.HighRiskEventsLast30Days = posture.HighRiskEventsLast30Days;
            entity.IsAnonymized = posture.IsAnonymized;
            entity.UpdatedAt = posture.UpdatedAt;
        }

        await _dbContext.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<UserSecurityPostureEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity != null)
        {
            _dbContext.Set<UserSecurityPostureEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(ct);
        }
    }

    public async Task DeleteByUserIdAsync(Guid tenantId, Guid userId, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<UserSecurityPostureEntity>()
            .FirstOrDefaultAsync(x => x.TenantId == tenantId && x.UserId == userId, ct);
        if (entity != null)
        {
            _dbContext.Set<UserSecurityPostureEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(ct);
        }
    }

    private static UserSecurityPosture MapToDomain(UserSecurityPostureEntity entity) => new()
    {
        Id = entity.Id,
        TenantId = entity.TenantId,
        UserId = entity.UserId,
        LastSignInAt = entity.LastSignInAt,
        MfaEnabled = entity.MfaEnabled,
        EnabledAppsCount = entity.EnabledAppsCount,
        UsedAppsLast30DaysCount = entity.UsedAppsLast30DaysCount,
        HighRiskEventsLast30Days = entity.HighRiskEventsLast30Days,
        IsAnonymized = entity.IsAnonymized,
        UpdatedAt = entity.UpdatedAt
    };

    private static UserSecurityPostureEntity MapToEntity(UserSecurityPosture posture) => new()
    {
        Id = posture.Id,
        TenantId = posture.TenantId,
        UserId = posture.UserId,
        LastSignInAt = posture.LastSignInAt,
        MfaEnabled = posture.MfaEnabled,
        EnabledAppsCount = posture.EnabledAppsCount,
        UsedAppsLast30DaysCount = posture.UsedAppsLast30DaysCount,
        HighRiskEventsLast30Days = posture.HighRiskEventsLast30Days,
        IsAnonymized = posture.IsAnonymized,
        UpdatedAt = posture.UpdatedAt
    };
}
