using Microsoft.EntityFrameworkCore;
using Onesign.Modules.AdaptiveSecurity.Domain.Entities;
using Onesign.Modules.AdaptiveSecurity.Domain.Repositories;
using Onesign.Modules.AdaptiveSecurity.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.AdaptiveSecurity.Infrastructure.EfCore.Repositories;

public class UserSecurityContextRepository : IUserSecurityContextRepository
{
    private readonly DbContext _dbContext;

    public UserSecurityContextRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<UserSecurityContext?> GetByUserIdAsync(Guid tenantId, Guid userId, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<UserSecurityContextEntity>()
            .FirstOrDefaultAsync(x => x.TenantId == tenantId && x.UserId == userId, ct);
        return entity == null ? null : MapToDomain(entity);
    }

    public async Task<IReadOnlyList<UserSecurityContext>> GetHighRiskUsersAsync(Guid tenantId, int minRiskScore, CancellationToken ct = default)
    {
        var entities = await _dbContext.Set<UserSecurityContextEntity>()
            .Where(x => x.TenantId == tenantId && x.CurrentRiskScore >= minRiskScore)
            .OrderByDescending(x => x.CurrentRiskScore)
            .ToListAsync(ct);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task AddAsync(UserSecurityContext context, CancellationToken ct = default)
    {
        var entity = MapToEntity(context);
        await _dbContext.Set<UserSecurityContextEntity>().AddAsync(entity, ct);
        await _dbContext.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(UserSecurityContext context, CancellationToken ct = default)
    {
        var entity = await _dbContext.Set<UserSecurityContextEntity>()
            .FirstOrDefaultAsync(x => x.Id == context.Id, ct);
        if (entity != null)
        {
            entity.CurrentRiskScore = context.CurrentRiskScore;
            entity.RiskFactorsJson = context.RiskFactorsJson;
            entity.LastLoginLocation = context.LastLoginLocation;
            entity.LastLoginDevice = context.LastLoginDevice;
            entity.TrustedDevicesJson = context.TrustedDevicesJson;
            entity.TrustedLocationsJson = context.TrustedLocationsJson;
            entity.UpdatedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync(ct);
        }
    }

    private static UserSecurityContext MapToDomain(UserSecurityContextEntity entity) => new()
    {
        Id = entity.Id,
        TenantId = entity.TenantId,
        UserId = entity.UserId,
        CurrentRiskScore = entity.CurrentRiskScore,
        RiskFactorsJson = entity.RiskFactorsJson,
        LastLoginLocation = entity.LastLoginLocation,
        LastLoginDevice = entity.LastLoginDevice,
        TrustedDevicesJson = entity.TrustedDevicesJson,
        TrustedLocationsJson = entity.TrustedLocationsJson,
        UpdatedAt = entity.UpdatedAt
    };

    private static UserSecurityContextEntity MapToEntity(UserSecurityContext context) => new()
    {
        Id = context.Id,
        TenantId = context.TenantId,
        UserId = context.UserId,
        CurrentRiskScore = context.CurrentRiskScore,
        RiskFactorsJson = context.RiskFactorsJson,
        LastLoginLocation = context.LastLoginLocation,
        LastLoginDevice = context.LastLoginDevice,
        TrustedDevicesJson = context.TrustedDevicesJson,
        TrustedLocationsJson = context.TrustedLocationsJson,
        UpdatedAt = context.UpdatedAt
    };
}
