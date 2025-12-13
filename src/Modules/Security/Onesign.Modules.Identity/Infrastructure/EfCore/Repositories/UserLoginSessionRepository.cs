using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Identity.Domain.Entities;
using Onesign.Modules.Identity.Domain.Repositories;
using Onesign.Modules.Identity.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Identity.Infrastructure.EfCore.Repositories;

public class UserLoginSessionRepository : IUserLoginSessionRepository
{
    private readonly DbContext _dbContext;

    public UserLoginSessionRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<UserLoginSession?> GetByTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<UserLoginSessionEntity>()
            .FirstOrDefaultAsync(x => x.SessionToken == token && x.IsActive, cancellationToken);
        return entity == null ? null : MapToDomain(entity);
    }

    public async Task<UserLoginSession?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<UserLoginSessionEntity>()
            .FirstOrDefaultAsync(x => x.Id == id && x.IsActive, cancellationToken);
        return entity == null ? null : MapToDomain(entity);
    }

    public async Task<List<UserLoginSession>> GetByTenantUserIdAsync(Guid tenantUserId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<UserLoginSessionEntity>()
            .Where(x => x.TenantUserId == tenantUserId && x.IsActive && x.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(x => x.LastActiveAt)
            .ToListAsync(cancellationToken);
        return entities.Select(MapToDomain).ToList();
    }

    public async Task<UserLoginSession> AddAsync(UserLoginSession session, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(session);
        await _dbContext.Set<UserLoginSessionEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return MapToDomain(entity);
    }

    public async Task UpdateAsync(UserLoginSession session, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<UserLoginSessionEntity>()
            .FirstOrDefaultAsync(x => x.Id == session.Id, cancellationToken);
        if (entity != null)
        {
            entity.LastActiveAt = session.LastActiveAt;
            entity.IpAddress = session.IpAddress;
            entity.City = session.City;
            entity.Country = session.Country;
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<UserLoginSessionEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity != null)
        {
            entity.IsActive = false;
            entity.RevokedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task DeleteByTenantUserIdAsync(Guid tenantUserId, Guid currentSessionId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<UserLoginSessionEntity>()
            .Where(x => x.TenantUserId == tenantUserId && x.Id != currentSessionId && x.IsActive)
            .ToListAsync(cancellationToken);

        foreach (var entity in entities)
        {
            entity.IsActive = false;
            entity.RevokedAt = DateTime.UtcNow;
        }
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteExpiredAsync(CancellationToken cancellationToken = default)
    {
        var expired = await _dbContext.Set<UserLoginSessionEntity>()
            .Where(x => x.ExpiresAt < DateTime.UtcNow && x.IsActive)
            .ToListAsync(cancellationToken);

        foreach (var entity in expired)
        {
            entity.IsActive = false;
            entity.RevokedAt = DateTime.UtcNow;
        }
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private static UserLoginSession MapToDomain(UserLoginSessionEntity entity) => new()
    {
        Id = entity.Id,
        TenantUserId = entity.TenantUserId,
        SessionToken = entity.SessionToken,
        ExpiresAt = entity.ExpiresAt,
        CreatedAt = entity.CreatedAt,
        LastActiveAt = entity.LastActiveAt,
        IpAddress = entity.IpAddress,
        UserAgent = entity.UserAgent,
        DeviceType = entity.DeviceType,
        DeviceName = entity.DeviceName,
        Browser = entity.Browser,
        BrowserVersion = entity.BrowserVersion,
        OperatingSystem = entity.OperatingSystem,
        City = entity.City,
        Country = entity.Country
    };

    private static UserLoginSessionEntity MapToEntity(UserLoginSession session) => new()
    {
        Id = session.Id,
        TenantUserId = session.TenantUserId,
        SessionToken = session.SessionToken,
        ExpiresAt = session.ExpiresAt,
        CreatedAt = session.CreatedAt,
        LastActiveAt = session.LastActiveAt,
        IpAddress = session.IpAddress,
        UserAgent = session.UserAgent,
        DeviceType = session.DeviceType,
        DeviceName = session.DeviceName,
        Browser = session.Browser,
        BrowserVersion = session.BrowserVersion,
        OperatingSystem = session.OperatingSystem,
        City = session.City,
        Country = session.Country,
        IsActive = true
    };
}

