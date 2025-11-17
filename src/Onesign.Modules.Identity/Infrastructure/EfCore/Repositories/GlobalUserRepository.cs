using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Identity.Domain.Entities;
using Onesign.Modules.Identity.Domain.Repositories;
using Onesign.Modules.Identity.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Identity.Infrastructure.EfCore.Repositories;

public class GlobalUserRepository : IGlobalUserRepository
{
    private readonly DbContext _dbContext;

    public GlobalUserRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<GlobalUser?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<GlobalUserEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        return entity == null ? null : MapToDomain(entity);
    }

    public async Task<GlobalUser?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<GlobalUserEntity>()
            .FirstOrDefaultAsync(x => x.Email == email, cancellationToken);
        return entity == null ? null : MapToDomain(entity);
    }

    public async Task<GlobalUser> AddAsync(GlobalUser user, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(user);
        await _dbContext.Set<GlobalUserEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return MapToDomain(entity);
    }

    public async Task UpdateAsync(GlobalUser user, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<GlobalUserEntity>()
            .FirstOrDefaultAsync(x => x.Id == user.Id, cancellationToken);
        if (entity != null)
        {
            entity.Email = user.Email;
            entity.PasswordHash = user.PasswordHash;
            entity.EmailVerified = user.EmailVerified;
            entity.UpdatedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    private static GlobalUser MapToDomain(GlobalUserEntity entity) => new()
    {
        Id = entity.Id,
        Email = entity.Email,
        PasswordHash = entity.PasswordHash,
        EmailVerified = entity.EmailVerified,
        CreatedAt = entity.CreatedAt,
        UpdatedAt = entity.UpdatedAt
    };

    private static GlobalUserEntity MapToEntity(GlobalUser user) => new()
    {
        Id = user.Id,
        Email = user.Email,
        PasswordHash = user.PasswordHash,
        EmailVerified = user.EmailVerified,
        CreatedAt = user.CreatedAt,
        UpdatedAt = user.UpdatedAt
    };
}

