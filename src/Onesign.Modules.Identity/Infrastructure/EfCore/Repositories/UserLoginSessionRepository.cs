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
            .FirstOrDefaultAsync(x => x.SessionToken == token, cancellationToken);
        return entity == null ? null : MapToDomain(entity);
    }

    public async Task<UserLoginSession> AddAsync(UserLoginSession session, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(session);
        await _dbContext.Set<UserLoginSessionEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return MapToDomain(entity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<UserLoginSessionEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity != null)
        {
            _dbContext.Set<UserLoginSessionEntity>().Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task DeleteExpiredAsync(CancellationToken cancellationToken = default)
    {
        var expired = await _dbContext.Set<UserLoginSessionEntity>()
            .Where(x => x.ExpiresAt < DateTime.UtcNow)
            .ToListAsync(cancellationToken);
        _dbContext.Set<UserLoginSessionEntity>().RemoveRange(expired);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private static UserLoginSession MapToDomain(UserLoginSessionEntity entity) => new()
    {
        Id = entity.Id,
        TenantUserId = entity.TenantUserId,
        SessionToken = entity.SessionToken,
        ExpiresAt = entity.ExpiresAt,
        CreatedAt = entity.CreatedAt,
        IpAddress = entity.IpAddress,
        UserAgent = entity.UserAgent
    };

    private static UserLoginSessionEntity MapToEntity(UserLoginSession session) => new()
    {
        Id = session.Id,
        TenantUserId = session.TenantUserId,
        SessionToken = session.SessionToken,
        ExpiresAt = session.ExpiresAt,
        CreatedAt = session.CreatedAt,
        IpAddress = session.IpAddress,
        UserAgent = session.UserAgent
    };
}

