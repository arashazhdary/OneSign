using Microsoft.EntityFrameworkCore;
using Onesign.Modules.IdentityInsights.Domain.Entities;
using Onesign.Modules.IdentityInsights.Domain.Repositories;
using Onesign.Modules.IdentityInsights.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.IdentityInsights.Infrastructure.EfCore.Repositories;

public class UserRiskProfileRepository : IUserRiskProfileRepository
{
    private readonly DbContext _dbContext;

    public UserRiskProfileRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<UserRiskProfile?> GetByUserIdAsync(Guid tenantId, Guid userId, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<UserRiskProfileEntity>()
            .FirstOrDefaultAsync(x => x.TenantId == tenantId && x.UserId == userId, ct);
        return entity == null ? null : MapToDomain(entity);
    }

    public async Task<IReadOnlyList<UserRiskProfile>> GetHighRiskUsersAsync(Guid tenantId, int minRiskScore, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<UserRiskProfileEntity>()
            .Where(x => x.TenantId == tenantId && x.RiskScore >= minRiskScore)
            .OrderByDescending(x => x.RiskScore)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task AddAsync(UserRiskProfile profile, CancellationToken ct = default)
    {
        var entity = MapToEntity(profile);
        await _dbContext.Set<UserRiskProfileEntity>().AddAsync(entity, ct);
        await _dbContext.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(UserRiskProfile profile, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<UserRiskProfileEntity>()
            .FirstOrDefaultAsync(x => x.Id == profile.Id, ct);
        if (entity != null)
        {
            entity.RiskScore = profile.RiskScore;
            entity.RiskFactorsJson = profile.RiskFactorsJson;
            entity.LastLoginAt = profile.LastLoginAt;
            entity.FailedLoginCount = profile.FailedLoginCount;
            entity.MfaEnabled = profile.MfaEnabled;
            entity.PrivilegedRolesCount = profile.PrivilegedRolesCount;
            entity.ApplicationsCount = profile.ApplicationsCount;
            entity.CalculatedAt = profile.CalculatedAt;
            entity.UpdatedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync(ct);
        }
    }

    private static UserRiskProfile MapToDomain(UserRiskProfileEntity entity) => new()
    {
        Id = entity.Id,
        TenantId = entity.TenantId,
        UserId = entity.UserId,
        UserDisplayName = entity.UserDisplayName,
        RiskScore = entity.RiskScore,
        RiskFactorsJson = entity.RiskFactorsJson,
        LastLoginAt = entity.LastLoginAt,
        FailedLoginCount = entity.FailedLoginCount,
        MfaEnabled = entity.MfaEnabled,
        PrivilegedRolesCount = entity.PrivilegedRolesCount,
        ApplicationsCount = entity.ApplicationsCount,
        CalculatedAt = entity.CalculatedAt,
        UpdatedAt = entity.UpdatedAt
    };

    private static UserRiskProfileEntity MapToEntity(UserRiskProfile profile) => new()
    {
        Id = profile.Id,
        TenantId = profile.TenantId,
        UserId = profile.UserId,
        UserDisplayName = profile.UserDisplayName,
        RiskScore = profile.RiskScore,
        RiskFactorsJson = profile.RiskFactorsJson,
        LastLoginAt = profile.LastLoginAt,
        FailedLoginCount = profile.FailedLoginCount,
        MfaEnabled = profile.MfaEnabled,
        PrivilegedRolesCount = profile.PrivilegedRolesCount,
        ApplicationsCount = profile.ApplicationsCount,
        CalculatedAt = profile.CalculatedAt,
        UpdatedAt = profile.UpdatedAt
    };
}
