using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Identity.Domain.Entities;
using Onesign.Modules.Identity.Domain.Repositories;
using Onesign.Modules.Identity.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Identity.Infrastructure.EfCore.Repositories;

public class MagicLinkTokenRepository : IMagicLinkTokenRepository
{
    private readonly DbContext _dbContext;

    public MagicLinkTokenRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<MagicLinkToken?> GetByTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<MagicLinkTokenEntity>()
            .FirstOrDefaultAsync(x => x.Token == token, cancellationToken);
        return entity == null ? null : MapToDomain(entity);
    }

    public async Task<MagicLinkToken> AddAsync(MagicLinkToken token, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(token);
        await _dbContext.Set<MagicLinkTokenEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return MapToDomain(entity);
    }

    public async Task UpdateAsync(MagicLinkToken token, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<MagicLinkTokenEntity>()
            .FirstOrDefaultAsync(x => x.Id == token.Id, cancellationToken);
        if (entity != null)
        {
            entity.IsUsed = token.IsUsed;
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    private static MagicLinkToken MapToDomain(MagicLinkTokenEntity entity) => new()
    {
        Id = entity.Id,
        TenantUserId = entity.TenantUserId,
        Token = entity.Token,
        ExpiresAt = entity.ExpiresAt,
        IsUsed = entity.IsUsed,
        CreatedAt = entity.CreatedAt
    };

    private static MagicLinkTokenEntity MapToEntity(MagicLinkToken token) => new()
    {
        Id = token.Id,
        TenantUserId = token.TenantUserId,
        Token = token.Token,
        ExpiresAt = token.ExpiresAt,
        IsUsed = token.IsUsed,
        CreatedAt = token.CreatedAt
    };
}
