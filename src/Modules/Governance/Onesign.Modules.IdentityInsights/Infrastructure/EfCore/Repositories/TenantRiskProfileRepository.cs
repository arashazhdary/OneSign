using Microsoft.EntityFrameworkCore;
using Onesign.Modules.IdentityInsights.Domain.Entities;
using Onesign.Modules.IdentityInsights.Domain.Repositories;
using Onesign.Modules.IdentityInsights.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.IdentityInsights.Infrastructure.EfCore.Repositories;

public class TenantRiskProfileRepository : ITenantRiskProfileRepository
{
    private readonly DbContext _dbContext;

    public TenantRiskProfileRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<TenantRiskProfile?> GetByTenantIdAsync(Guid tenantId, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<TenantRiskProfileEntity>()
            .FirstOrDefaultAsync(x => x.TenantId == tenantId, ct);
        return entity == null ? null : MapToDomain(entity);
    }

    public async Task<IReadOnlyList<TenantRiskProfile>> GetHighRiskTenantsAsync(int minRiskScore, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<TenantRiskProfileEntity>()
            .Where(x => x.RiskScore >= minRiskScore)
            .OrderByDescending(x => x.RiskScore)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task AddAsync(TenantRiskProfile profile, CancellationToken ct = default)
    {
        var entity = MapToEntity(profile);
        await _dbContext.Set<TenantRiskProfileEntity>().AddAsync(entity, ct);
        await _dbContext.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(TenantRiskProfile profile, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<TenantRiskProfileEntity>()
            .FirstOrDefaultAsync(x => x.Id == profile.Id, ct);
        if (entity != null)
        {
            entity.RiskScore = profile.RiskScore;
            entity.UsersCount = profile.UsersCount;
            entity.HighRiskUsersCount = profile.HighRiskUsersCount;
            entity.MfaEnrollmentRate = profile.MfaEnrollmentRate;
            entity.PrivilegedUsersCount = profile.PrivilegedUsersCount;
            entity.FailedLoginRate = profile.FailedLoginRate;
            entity.OpenGovernanceFindingsCount = profile.OpenGovernanceFindingsCount;
            entity.CalculatedAt = profile.CalculatedAt;
            await _dbContext.SaveChangesAsync(ct);
        }
    }

    private static TenantRiskProfile MapToDomain(TenantRiskProfileEntity entity) => new()
    {
        Id = entity.Id,
        TenantId = entity.TenantId,
        RiskScore = entity.RiskScore,
        UsersCount = entity.UsersCount,
        HighRiskUsersCount = entity.HighRiskUsersCount,
        MfaEnrollmentRate = entity.MfaEnrollmentRate,
        PrivilegedUsersCount = entity.PrivilegedUsersCount,
        FailedLoginRate = entity.FailedLoginRate,
        OpenGovernanceFindingsCount = entity.OpenGovernanceFindingsCount,
        CalculatedAt = entity.CalculatedAt
    };

    private static TenantRiskProfileEntity MapToEntity(TenantRiskProfile profile) => new()
    {
        Id = profile.Id,
        TenantId = profile.TenantId,
        RiskScore = profile.RiskScore,
        UsersCount = profile.UsersCount,
        HighRiskUsersCount = profile.HighRiskUsersCount,
        MfaEnrollmentRate = profile.MfaEnrollmentRate,
        PrivilegedUsersCount = profile.PrivilegedUsersCount,
        FailedLoginRate = profile.FailedLoginRate,
        OpenGovernanceFindingsCount = profile.OpenGovernanceFindingsCount,
        CalculatedAt = profile.CalculatedAt
    };
}
