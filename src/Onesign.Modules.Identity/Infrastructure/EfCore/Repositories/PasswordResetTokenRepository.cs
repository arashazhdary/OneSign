using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Identity.Domain.Entities;
using Onesign.Modules.Identity.Domain.Repositories;
using Onesign.Modules.Identity.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Identity.Infrastructure.EfCore.Repositories;

public class PasswordResetTokenRepository : IPasswordResetTokenRepository
{
    private readonly DbContext _dbContext;

    public PasswordResetTokenRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<PasswordResetToken?> GetByTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<PasswordResetTokenEntity>()
            .FirstOrDefaultAsync(x => x.Token == token, cancellationToken);
        return entity == null ? null : MapToDomain(entity);
    }

    public async Task<PasswordResetToken> AddAsync(PasswordResetToken token, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(token);
        await _dbContext.Set<PasswordResetTokenEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return MapToDomain(entity);
    }

    public async Task UpdateAsync(PasswordResetToken token, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<PasswordResetTokenEntity>()
            .FirstOrDefaultAsync(x => x.Id == token.Id, cancellationToken);
        if (entity != null)
        {
            entity.IsUsed = token.IsUsed;
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    private static PasswordResetToken MapToDomain(PasswordResetTokenEntity entity) => new()
    {
        Id = entity.Id,
        TenantUserId = entity.TenantUserId,
        Token = entity.Token,
        ExpiresAt = entity.ExpiresAt,
        IsUsed = entity.IsUsed,
        CreatedAt = entity.CreatedAt
    };

    private static PasswordResetTokenEntity MapToEntity(PasswordResetToken token) => new()
    {
        Id = token.Id,
        TenantUserId = token.TenantUserId,
        Token = token.Token,
        ExpiresAt = token.ExpiresAt,
        IsUsed = token.IsUsed,
        CreatedAt = token.CreatedAt
    };
}

